package com.example.appointment.service;

import com.example.appointment.entity.Doctor;
import com.example.appointment.entity.Hospital;
import com.example.appointment.repository.DoctorRepository;
import com.example.appointment.repository.HospitalRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final HospitalRepository hospitalRepository;

    public DoctorService(DoctorRepository doctorRepository, HospitalRepository hospitalRepository) {
        this.doctorRepository = doctorRepository;
        this.hospitalRepository = hospitalRepository;
    }

    public List<Doctor> getAll() {
        return doctorRepository.findAll();
    }

    public List<Doctor> getByHospital(Long hospitalId) {
        return doctorRepository.findByHospitalId(hospitalId);
    }

    public Doctor add(Doctor doctor) {
        if (doctor.getName() == null || doctor.getName().isBlank()
                || doctor.getSpecialization() == null || doctor.getSpecialization().isBlank()) {
            throw new RuntimeException("Doctor name and specialization are required");
        }
        if (doctor.getHospital() == null || doctor.getHospital().getId() == null) {
            throw new RuntimeException("Please choose a hospital for the doctor");
        }
        Hospital h = hospitalRepository.findById(doctor.getHospital().getId())
                .orElseThrow(() -> new RuntimeException("Hospital not found"));
        doctor.setHospital(h);
        return doctorRepository.save(doctor);
    }

    public void delete(Long id) {
        doctorRepository.deleteById(id);
    }
}
