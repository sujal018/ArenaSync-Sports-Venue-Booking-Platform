package com.turfbooking.security;


import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class CustomJwtVerificationFilter extends OncePerRequestFilter {

	private final JwtUtils jwtUtils;
	
	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {

		try {
			
			String header = request.getHeader("Authorization");
			
			if(header != null && header.startsWith("Bearer "))
			{
				String jwt = header.substring(7);
				Claims claims = jwtUtils.validateTokenAndGetClaims(jwt);
				
				Long userId = claims.get("user_id", Long.class);
				String email = claims.get("user_email", String.class);
				String role = claims.get("user_role", String.class);
				
				JwtPrincipal principal = new JwtPrincipal(userId, email);
				
				// FIX: prefix with "ROLE_" - hasRole('ADMIN') internally checks
				// for the authority string "ROLE_ADMIN"; without this prefix
				// every hasRole()/hasAnyRole() check silently denies everyone,
				// including legitimate admins/owners.
				UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(principal, null,
						List.of(new SimpleGrantedAuthority("ROLE_" + role)));
				
				SecurityContextHolder.getContext().setAuthentication(auth);
			}
			
		}
		catch (Exception e) {
			SecurityContextHolder.clearContext();
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
			response.getWriter().print("Invalid JWT !!!");
			return;
		}
		
		filterChain.doFilter(request, response);
		
	}
	
}

