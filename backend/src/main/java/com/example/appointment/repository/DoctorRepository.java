package com.example.appointment.repository;

import com.example.appointment.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    List<Doctor> findByHospitalId(Long hospitalId);
    Optional<Doctor> findByNameAndHospitalId(String name, Long hospitalId);
}
