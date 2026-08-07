package com.buildtrack.ai.auth.security.oauth2;

import com.buildtrack.ai.auth.entity.AuthProvider;
import com.buildtrack.ai.auth.entity.Role;
import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.auth.repository.RoleRepository;
import com.buildtrack.ai.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

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
        User user;

        if (userOptional.isPresent()) {
            user = userOptional.get();
            user.setFirstName(googleUser.getFirstName() != null ? googleUser.getFirstName() : user.getFirstName());
            user.setLastName(googleUser.getLastName() != null ? googleUser.getLastName() : user.getLastName());
            user = userRepository.save(user);
        } else {
            Role companyAdminRole = roleRepository.findByRoleName("COMPANY_ADMIN")
                    .orElseGet(() -> roleRepository.save(Role.builder().roleName("COMPANY_ADMIN").build()));

            user = User.builder()
                    .firstName(googleUser.getFirstName() != null ? googleUser.getFirstName() : "Google")
                    .lastName(googleUser.getLastName() != null ? googleUser.getLastName() : "User")
                    .email(googleUser.getEmail())
                    .password("") // External OAuth user
                    .enabled(true)
                    .provider(AuthProvider.GOOGLE)
                    .roles(Set.of(companyAdminRole))
                    .build();

            user = userRepository.save(user);
        }

        return oAuth2User;
    }
}
