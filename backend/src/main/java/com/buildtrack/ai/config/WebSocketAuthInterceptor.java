package com.buildtrack.ai.config;

import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.auth.repository.UserRepository;
import com.buildtrack.ai.auth.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final UserRepository userRepository;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        StompCommand command = accessor.getCommand();

        if (StompCommand.CONNECT.equals(command)) {
            String auth = accessor.getFirstNativeHeader("Authorization");
            if (auth == null || !auth.startsWith("Bearer ")) {
                throw new IllegalArgumentException("WebSocket authentication required");
            }
            String token = auth.substring(7);
            String email = jwtService.extractUsername(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            if (!jwtService.isTokenValid(token, userDetails)) {
                throw new IllegalArgumentException("Invalid WebSocket token");
            }
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("WebSocket user not found"));
            if (!user.isEnabled()) throw new IllegalArgumentException("WebSocket user is disabled");
            accessor.setUser(() -> email);
            return message;
        }

        if (StompCommand.SUBSCRIBE.equals(command)) {
            String destination = accessor.getDestination();
            String email = accessor.getUser() == null ? null : accessor.getUser().getName();
            if (email == null || destination == null) {
                throw new IllegalArgumentException("Authenticated WebSocket subscription required");
            }
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("WebSocket user not found"));

            if (destination.startsWith("/topic/company/")) {
                String remainder = destination.substring("/topic/company/".length());
                int slash = remainder.indexOf('/');
                String companyId = slash >= 0 ? remainder.substring(0, slash) : remainder;
                if (user.getCompanyId() == null || !String.valueOf(user.getCompanyId()).equals(companyId)) {
                    throw new IllegalArgumentException("Cannot subscribe to another company channel");
                }
            } else if (destination.startsWith("/user/queue/notifications")) {
                // Private channel; convertAndSendToUser routes it to the authenticated principal.
            } else {
                throw new IllegalArgumentException("Unsupported WebSocket subscription");
            }
        }
        return message;
    }
}
