package com.example.appointment.controller;

import com.example.appointment.entity.Hospital;
import com.example.appointment.service.HospitalService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hospitals")
@CrossOrigin
public class HospitalController {

    private final HospitalService hospitalService;

    public HospitalController(HospitalService hospitalService) {
        this.hospitalService = hospitalService;
    }

    @GetMapping
    public List<Hospital> getAll() {
        return hospitalService.getAll();
    }

    @PostMapping
    public Hospital add(@RequestBody Hospital hospital) {
        return hospitalService.add(hospital);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        hospitalService.delete(id);
    }
}
