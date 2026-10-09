package com.example.appointment.service;

import com.example.appointment.dto.BookingRequest;
import com.example.appointment.entity.Appointment;
import com.example.appointment.entity.Doctor;
import com.example.appointment.entity.User;
import com.example.appointment.repository.AppointmentRepository;
import com.example.appointment.repository.DoctorRepository;
import com.example.appointment.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              UserRepository userRepository,
                              DoctorRepository doctorRepository) {
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
    }

    public Appointment book(BookingRequest req) {
        if (req.getAppointmentDate() == null || req.getAppointmentTime() == null) {
            throw new RuntimeException("Date and time are required");
        }
        if (req.getAppointmentDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Cannot book an appointment in the past");
        }

        User patient = userRepository.findById(req.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        Doctor doctor = doctorRepository.findById(req.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        // Prevent double booking
        boolean taken = appointmentRepository
                .existsByDoctorIdAndAppointmentDateAndAppointmentTimeAndStatus(
                        doctor.getId(), req.getAppointmentDate(), req.getAppointmentTime(), "BOOKED");
        if (taken) {
            throw new RuntimeException("This slot is already booked. Please choose another time.");
        }

        Appointment a = new Appointment();
        a.setPatient(patient);
        a.setDoctor(doctor);
        a.setAppointmentDate(req.getAppointmentDate());
        a.setAppointmentTime(req.getAppointmentTime());
        a.setFee(doctor.getFee());
        a.setStatus("BOOKED");
        return appointmentRepository.save(a);
    }

    public List<Appointment> getAll() {
        return appointmentRepository.findAll();
    }

    public List<Appointment> getByPatient(Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    public List<Appointment> getByDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }

    // Times already booked for a doctor on a date (used to grey out slots)
    public List<String> getBookedTimes(Long doctorId, LocalDate date) {
        return appointmentRepository
                .findByDoctorIdAndAppointmentDateAndStatus(doctorId, date, "BOOKED")
                .stream()
                .map(a -> a.getAppointmentTime().toString())
                .toList();
    }

    public Appointment cancel(Long id) {
        Appointment a = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        a.setStatus("CANCELLED");
        return appointmentRepository.save(a);
    }
}
