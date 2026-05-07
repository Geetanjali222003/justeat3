package com.example.JustEat;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class JustEatApplication {

	public static void main(String[] args) {

        SpringApplication.run(JustEatApplication.class, args);
	}

}
