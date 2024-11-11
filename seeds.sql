-- Clear tables (optional, only use if needed)
TRUNCATE TABLE employee, role, department RESTART IDENTITY;

-- Insert departments with explicit IDs (optional, to enforce alignment)
INSERT INTO department (id, name) VALUES 
(1, 'Sales'), 
(2, 'Engineering'), 
(3, 'Marketing');

-- Insert roles with explicit department references
INSERT INTO role (title, salary, department_id) VALUES 
('Sales Manager', 60000, 1),  -- department_id = 1 matches 'Sales'
('Software Engineer', 80000, 2), -- department_id = 2 matches 'Engineering'
('Marketing Coordinator', 50000, 3); -- department_id = 3 matches 'Marketing'

-- Insert employees with explicit role references
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
('John', 'Doe', 1, NULL),  -- role_id = 1 matches 'Sales Manager'
('Jane', 'Smith', 2, 1), -- role_id = 2 matches 'Software Engineer'
('Emily', 'Davis', 3, NULL); -- role_id = 3 matches 'Marketing Coordinator'


