package com.example.appointment.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "doctors")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String specialization;
    private String qualification;  // e.g. MBBS, MD
    private int experience;        // years
    private String availableDays;  // e.g. Mon,Wed,Fri
    private String timings;        // e.g. 10:00 AM - 4:00 PM
    private int fee;               // consultation fee in rupees

    // Each doctor belongs to ONE hospital (a hospital has MANY doctors)
    @ManyToOne
    @JoinColumn(name = "hospital_id")
    private Hospital hospital;
}
