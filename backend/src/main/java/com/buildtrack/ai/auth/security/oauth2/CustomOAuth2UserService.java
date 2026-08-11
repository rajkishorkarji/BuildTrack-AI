package com.buildtrack.ai.auth.security.oauth2;

import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        return processOAuth2User(userRequest, oAuth2User);
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest userRequest, OAuth2User oAuth2User) {
        GoogleOAuth2UserInfo googleUser = new GoogleOAuth2UserInfo(oAuth2User.getAttributes());

        if (googleUser.getEmail() == null || googleUser.getEmail().isBlank()) {
            throw new OAuth2AuthenticationException("Email not provided from OAuth2 provider");
        }

        Optional<User> userOptional = userRepository.findByEmail(googleUser.getEmail());

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            // Update name from Google profile if available
            user.setFirstName(googleUser.getFirstName() != null ? googleUser.getFirstName() : user.getFirstName());
            user.setLastName(googleUser.getLastName() != null ? googleUser.getLastName() : user.getLastName());
            user.setProvider(com.buildtrack.ai.auth.entity.AuthProvider.GOOGLE);
            userRepository.save(user);
        } else {
            // Reject Google login for emails not already registered on the platform.
            // Users must be invited by a Company Admin and must complete the invitation
            // page (set a password) before they can use Google OAuth.
            throw new OAuth2AuthenticationException(
                "Your Google account email is not registered on the BuildTrack AI platform. " +
                "Please accept your invitation and sign in with your password first."
            );
        }

        return oAuth2User;
    }
}
