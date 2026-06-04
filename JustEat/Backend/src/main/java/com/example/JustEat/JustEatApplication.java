package com.example.JustEat;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main entry point for the JustEat food ordering application.
 * @EnableScheduling allows scheduled tasks (e.g., OTP cleanup) to run automatically.
 */
@SpringBootApplication
@EnableScheduling
public class JustEatApplication {

	public static void main(String[] args) {
		SpringApplication.run(JustEatApplication.class, args);
	}

}
