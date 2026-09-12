package com.intern.campusreserve;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@MapperScan("com.intern.campusreserve.mapper")
@SpringBootApplication
@EnableScheduling
public class CampusReservationApplication {
    public static void main(String[] args) {
        SpringApplication.run(CampusReservationApplication.class, args);
    }
}
