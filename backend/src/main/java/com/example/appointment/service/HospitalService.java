package com.example.appointment.service;

import com.example.appointment.entity.Hospital;
import com.example.appointment.repository.HospitalRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HospitalService {

    private final HospitalRepository hospitalRepository;

    public HospitalService(HospitalRepository hospitalRepository) {
        this.hospitalRepository = hospitalRepository;
    }

    public List<Hospital> getAll() {
        return hospitalRepository.findAll();
    }

    public Hospital add(Hospital h) {
        if (h.getName() == null || h.getName().isBlank() || h.getAddress() == null || h.getAddress().isBlank()) {
            throw new RuntimeException("Hospital name and address are required");
        }
        if (h.getImageUrl() == null || h.getImageUrl().isBlank()) {
            h.setImageUrl("images/hospital-default.svg");
        }
        return hospitalRepository.save(h);
    }

    public void delete(Long id) {
        hospitalRepository.deleteById(id);
    }
}
