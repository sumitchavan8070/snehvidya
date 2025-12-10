-- Database schema for MCQ Exams
-- Run this SQL script to create the necessary tables

-- Table for storing MCQ exams
CREATE TABLE IF NOT EXISTS `mcq_exams` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `class_id` INT NOT NULL,
  `exam_date` DATE NOT NULL,
  `total_questions` INT NOT NULL,
  `total_marks` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_class_id` (`class_id`),
  INDEX `idx_exam_date` (`exam_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table for storing MCQ questions
CREATE TABLE IF NOT EXISTS `mcq_questions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `exam_id` INT NOT NULL,
  `question_number` INT NOT NULL,
  `question_text` TEXT NOT NULL,
  `option_a` VARCHAR(500) NOT NULL,
  `option_b` VARCHAR(500) NOT NULL,
  `option_c` VARCHAR(500) NOT NULL,
  `option_d` VARCHAR(500) NOT NULL,
  `correct_answer` ENUM('A', 'B', 'C', 'D') NOT NULL,
  `marks` INT NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`exam_id`) REFERENCES `mcq_exams`(`id`) ON DELETE CASCADE,
  INDEX `idx_exam_id` (`exam_id`),
  INDEX `idx_question_number` (`question_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table for storing student exam submissions
CREATE TABLE IF NOT EXISTS `student_exam_submissions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `exam_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  `started_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `submitted_at` TIMESTAMP NULL,
  `status` ENUM('in_progress', 'submitted', 'graded') DEFAULT 'in_progress',
  `total_score` DECIMAL(10,2) DEFAULT 0,
  `percentage` DECIMAL(5,2) DEFAULT 0,
  `time_taken_minutes` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`exam_id`) REFERENCES `mcq_exams`(`id`) ON DELETE CASCADE,
  INDEX `idx_exam_id` (`exam_id`),
  INDEX `idx_student_id` (`student_id`),
  INDEX `idx_status` (`status`),
  UNIQUE KEY `unique_student_exam` (`exam_id`, `student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table for storing student answers to each question
CREATE TABLE IF NOT EXISTS `student_exam_answers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `submission_id` INT NOT NULL,
  `question_id` INT NOT NULL,
  `student_answer` ENUM('A', 'B', 'C', 'D') NULL,
  `is_correct` BOOLEAN DEFAULT FALSE,
  `marks_obtained` DECIMAL(10,2) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`submission_id`) REFERENCES `student_exam_submissions`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`question_id`) REFERENCES `mcq_questions`(`id`) ON DELETE CASCADE,
  INDEX `idx_submission_id` (`submission_id`),
  INDEX `idx_question_id` (`question_id`),
  UNIQUE KEY `unique_submission_question` (`submission_id`, `question_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

