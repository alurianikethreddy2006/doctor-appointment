package com.example.appointment.controller;

import com.example.appointment.entity.Doctor;
import com.example.appointment.service.DoctorService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    @GetMapping
    public List<Doctor> getAll() {
        return doctorService.getAll();
    }

    @GetMapping("/hospital/{hospitalId}")
    public List<Doctor> byHospital(@PathVariable Long hospitalId) {
        return doctorService.getByHospital(hospitalId);
    }

    @PostMapping
    public Doctor add(@RequestBody Doctor doctor) {
        return doctorService.add(doctor);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        doctorService.delete(id);
    }
}
