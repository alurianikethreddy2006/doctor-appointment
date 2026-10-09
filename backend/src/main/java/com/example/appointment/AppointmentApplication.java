package com.example.appointment;

import com.example.appointment.entity.Doctor;
import com.example.appointment.entity.Hospital;
import com.example.appointment.entity.User;
import com.example.appointment.repository.DoctorRepository;
import com.example.appointment.repository.HospitalRepository;
import com.example.appointment.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class AppointmentApplication {

    public static void main(String[] args) {
        SpringApplication.run(AppointmentApplication.class, args);
    }

    /*
     * SAMPLE DATA - added automatically the first time the app starts.
     * Hospitals and doctors are skipped if they already exist, so it is safe to restart.
     * To add more: copy a line, change the details, restart the app.
     * (Or just use the Admin page in the browser.)
     */
    @Bean
    CommandLineRunner seedData(UserRepository users, HospitalRepository hospitals, DoctorRepository doctors) {
        return args -> {

            // ---- ADMIN LOGIN ----  email: admin@hospital.com   password: admin123
            if (users.findByEmail("admin@hospital.com").isEmpty()) {
                users.save(new User(null, "Admin", "admin@hospital.com", "admin123", "ADMIN"));
            }

            // ---- HOSPITALS ----  (name, address, city, phone, image, description)
            Hospital cityCare = hospital(hospitals, "City Care Hospital",
                    "Road No. 12, Banjara Hills", "Hyderabad - 500034", "040-4000 1001", "images/hospital1.svg",
                    "A 400-bed multispeciality hospital known for cardiology and neurology care.");
            Hospital sunrise = hospital(hospitals, "Sunrise Multispeciality Hospital",
                    "Plot 45, HITEC City Main Road, Madhapur", "Hyderabad - 500081", "040-4000 2002", "images/hospital2.svg",
                    "Modern hospital with advanced diagnostics, women's health and skin care centres.");
            Hospital greenValley = hospital(hospitals, "Green Valley Hospital",
                    "Survey No. 7, Financial District, Gachibowli", "Hyderabad - 500032", "040-4000 3003", "images/hospital3.svg",
                    "Family hospital offering general medicine, ENT and eye care with 24x7 emergency.");
            Hospital littleStars = hospital(hospitals, "Little Stars Children's Hospital",
                    "KPHB Colony, Phase 3, Kukatpally", "Hyderabad - 500072", "040-4000 4004", "images/hospital4.svg",
                    "Dedicated child care hospital with pediatric specialists and a newborn ICU.");
            Hospital apex = hospital(hospitals, "Apex Bone & Joint Hospital",
                    "SP Road, Near Clock Tower, Secunderabad", "Hyderabad - 500003", "040-4000 5005", "images/hospital5.svg",
                    "Specialised in orthopedics, joint replacement, sports injury and physiotherapy.");

            // ---- DOCTORS ----  (hospital, name, specialization, qualification, experience, days, timings, fee)
            // City Care Hospital
            doctor(doctors, cityCare, "Dr. Anil Kumar",   "Cardiologist",      "MBBS, MD, DM (Cardiology)", 12, "Mon,Wed,Fri", "10:00 AM - 4:00 PM", 800);
            doctor(doctors, cityCare, "Dr. Meena Rao",    "Neurologist",       "MBBS, MD, DM (Neurology)",  10, "Tue,Thu,Sat", "11:00 AM - 5:00 PM", 900);
            doctor(doctors, cityCare, "Dr. Karthik Rao",  "Urologist",         "MBBS, MS, MCh (Urology)",   13, "Mon,Tue,Fri", "9:00 AM - 1:00 PM",  700);
            doctor(doctors, cityCare, "Dr. Rahul Verma",  "General Physician", "MBBS, MD (Medicine)",       16, "Mon-Sat",     "9:00 AM - 5:00 PM",  400);

            // Sunrise Multispeciality Hospital
            doctor(doctors, sunrise, "Dr. Sneha Reddy",   "Dermatologist",     "MBBS, MD (Dermatology)",    8,  "Tue,Thu,Sat", "10:00 AM - 3:00 PM", 600);
            doctor(doctors, sunrise, "Dr. Kavya Nair",    "Gynecologist",      "MBBS, MS (OBG)",            9,  "Mon-Fri",     "10:00 AM - 5:00 PM", 700);
            doctor(doctors, sunrise, "Dr. Anjali Gupta",  "Psychiatrist",      "MBBS, MD (Psychiatry)",     8,  "Mon,Wed,Fri", "2:00 PM - 6:00 PM",  750);
            doctor(doctors, sunrise, "Dr. Vikram Singh",  "Endocrinologist",   "MBBS, MD, DM (Endocrinology)", 11, "Tue,Thu",  "11:00 AM - 4:00 PM", 850);

            // Green Valley Hospital
            doctor(doctors, greenValley, "Dr. Ravi Teja",    "General Physician", "MBBS, MD (Medicine)",    15, "Mon-Sat",     "9:00 AM - 6:00 PM",  350);
            doctor(doctors, greenValley, "Dr. Imran Khan",   "ENT Specialist",    "MBBS, MS (ENT)",         7,  "Mon,Thu,Sat", "10:00 AM - 4:00 PM", 500);
            doctor(doctors, greenValley, "Dr. Lakshmi Devi", "Ophthalmologist",   "MBBS, MS (Ophthalmology)", 11, "Mon-Sat",   "9:00 AM - 3:00 PM",  550);
            doctor(doctors, greenValley, "Dr. Sandeep Joshi","Gastroenterologist","MBBS, MD, DM (Gastro)",  12, "Wed,Fri,Sat", "10:00 AM - 2:00 PM", 800);

            // Little Stars Children's Hospital
            doctor(doctors, littleStars, "Dr. Priya Sharma",  "Pediatrician",          "MBBS, MD (Pediatrics)",  10, "Mon,Tue,Thu", "9:00 AM - 3:00 PM",  500);
            doctor(doctors, littleStars, "Dr. Naveen Prasad", "Neonatologist",         "MBBS, MD, DM (Neonatology)", 14, "Mon-Fri", "10:00 AM - 4:00 PM", 900);
            doctor(doctors, littleStars, "Dr. Sowmya Iyer",   "Pediatric Dentist",     "BDS, MDS (Pedodontics)", 6,  "Tue,Thu,Sat", "11:00 AM - 5:00 PM", 450);
            doctor(doctors, littleStars, "Dr. Farah Ali",     "Child Psychologist",    "MA, M.Phil (Clinical Psychology)", 9, "Mon,Wed,Fri", "2:00 PM - 6:00 PM", 600);

            // Apex Bone & Joint Hospital
            doctor(doctors, apex, "Dr. Suresh Babu",    "Orthopedic Surgeon", "MBBS, MS (Ortho)",          14, "Tue,Thu,Sat", "10:00 AM - 4:00 PM", 800);
            doctor(doctors, apex, "Dr. Arjun Mehta",    "Sports Medicine",    "MBBS, MD (Sports Medicine)", 9, "Mon,Wed,Fri", "9:00 AM - 1:00 PM",  700);
            doctor(doctors, apex, "Dr. Deepa Menon",    "Physiotherapist",    "BPT, MPT (Ortho)",          8,  "Mon-Sat",     "8:00 AM - 2:00 PM",  400);
            doctor(doctors, apex, "Dr. Harish Chandra", "Spine Surgeon",      "MBBS, MS, MCh (Spine)",     18, "Wed,Fri",     "11:00 AM - 3:00 PM", 1200);
        };
    }

    // helper: add hospital only if its name is not already in the database
    private Hospital hospital(HospitalRepository repo, String name, String address, String city,
                              String phone, String image, String description) {
        return repo.findByName(name)
                .orElseGet(() -> repo.save(new Hospital(null, name, address, city, phone, image, description)));
    }

    // helper: add doctor only if that doctor is not already in that hospital
    private void doctor(DoctorRepository repo, Hospital h, String name, String spec, String qualification,
                        int experience, String days, String timings, int fee) {
        if (repo.findByNameAndHospitalId(name, h.getId()).isEmpty()) {
            repo.save(new Doctor(null, name, spec, qualification, experience, days, timings, fee, h));
        }
    }
}
