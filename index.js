// Import required modules
import inquirer from 'inquirer';
import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'employee_tracker',
  password: '199701',
  port: 5432,
});

// Connect to the database
async function connectDatabase() {
  try {
    await client.connect();
    console.log("Connected to the database.");
  } catch (err) {
    console.error("Error connecting to the database:", err);
  }
}

// Function to display the main menu
async function showMainMenu() {
  const choices = [
    "View All Employees",
    "Add Employee",
    "Update Employee Role",
    "Update Employee Manager", // New
    "View Employees by Manager", // New
    "View Employees by Department", // New
    "Delete Department", // New
    "Delete Role", // New
    "Delete Employee", // New
    "View Total Utilized Budget by Department", // New
    "View All Roles",
    "Add Role",
    "View All Departments",
    "Add Department",
    "Exit"
  ];

  const { action } = await inquirer.prompt({
    type: 'list',
    name: 'action',
    message: 'What would you like to do?',
    choices
  });

  switch (action) {
    case "View All Employees":
      await viewAllEmployees();
      break;
    case "Add Employee":
      await addEmployee();
      break;
    case "Update Employee Role":
      await updateEmployeeRole();
      break;
    case "Update Employee Manager":
      await updateEmployeeManager(); // New
      break;
    case "View Employees by Manager":
      await viewEmployeesByManager(); // New
      break;
    case "View Employees by Department":
      await viewEmployeesByDepartment(); // New
      break;
    case "Delete Department":
      await deleteDepartment(); // New
      break;
    case "Delete Role":
      await deleteRole(); // New
      break;
    case "Delete Employee":
      await deleteEmployee(); // New
      break;
    case "View Total Utilized Budget by Department":
      await viewTotalBudgetByDepartment(); // New
      break;
    case "View All Roles":
      await viewAllRoles();
      break;
    case "Add Role":
      await addRole();
      break;
    case "View All Departments":
      await viewAllDepartments();
      break;
    case "Add Department":
      await addDepartment();
      break;
    case "Exit":
      await client.end();
      console.log("Goodbye!");
      process.exit();
  }

  await showMainMenu();
}

// Function to view all employees
async function viewAllEmployees() {
  const result = await client.query(`
    SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, 
           CONCAT(m.first_name, ' ', m.last_name) AS manager
    FROM employee e
    LEFT JOIN role r ON e.role_id = r.id
    LEFT JOIN department d ON r.department_id = d.id
    LEFT JOIN employee m ON e.manager_id = m.id;
  `);
  console.table(result.rows);
}

// Function to add an employee
async function addEmployee() {
  const roleResult = await client.query(`SELECT id, title FROM role`);
  console.log("\nAvailable Roles:");
  console.table(roleResult.rows);

  const { firstName, lastName, roleId, managerId } = await inquirer.prompt([
    { type: 'input', name: 'firstName', message: 'Employee First Name:' },
    { type: 'input', name: 'lastName', message: 'Employee Last Name:' },
    { type: 'input', name: 'roleId', message: 'Role ID (choose from the list above):' },
    { type: 'input', name: 'managerId', message: 'Manager ID (Leave blank if none):' }
  ]);

  const parsedRoleId = parseInt(roleId, 10);
  const parsedManagerId = managerId ? parseInt(managerId, 10) : null;

  if (isNaN(parsedRoleId)) {
    console.error("Invalid role ID. Please enter a valid integer.");
    return;
  }

  await client.query(
    `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)`,
    [firstName, lastName, parsedRoleId, parsedManagerId]
  );

  console.log("Employee added successfully!");
}

// Function to update an employee's role
async function updateEmployeeRole() {
  const { employeeId, roleId } = await inquirer.prompt([
    { type: 'input', name: 'employeeId', message: 'Enter Employee ID to update role:' },
    { type: 'input', name: 'roleId', message: 'Enter new Role ID:' }
  ]);

  await client.query(
    `UPDATE employee SET role_id = $1 WHERE id = $2`,
    [roleId, employeeId]
  );

  console.log("Employee role updated successfully!");
}

// Function to update an employee's manager
async function updateEmployeeManager() {
  const { employeeId, managerId } = await inquirer.prompt([
    { type: 'input', name: 'employeeId', message: 'Enter Employee ID to update manager:' },
    { type: 'input', name: 'managerId', message: 'Enter new Manager ID (leave blank to remove):' }
  ]);

  const parsedManagerId = managerId ? parseInt(managerId, 10) : null;

  await client.query(
    `UPDATE employee SET manager_id = $1 WHERE id = $2`,
    [parsedManagerId, parseInt(employeeId, 10)]
  );

  console.log("Employee manager updated successfully!");
}

// Function to view employees by manager
async function viewEmployeesByManager() {
  const { managerId } = await inquirer.prompt([
    { type: 'input', name: 'managerId', message: 'Enter the Manager ID:' }
  ]);

  const result = await client.query(`
    SELECT e.id, e.first_name, e.last_name, r.title
    FROM employee e
    LEFT JOIN role r ON e.role_id = r.id
    WHERE e.manager_id = $1;
  `, [parseInt(managerId, 10)]);

  console.table(result.rows);
}

// Function to view employees by department
async function viewEmployeesByDepartment() {
  const { departmentId } = await inquirer.prompt([
    { type: 'input', name: 'departmentId', message: 'Enter the Department ID:' }
  ]);

  const result = await client.query(`
    SELECT e.id, e.first_name, e.last_name, r.title
    FROM employee e
    LEFT JOIN role r ON e.role_id = r.id
    LEFT JOIN department d ON r.department_id = d.id
    WHERE d.id = $1;
  `, [parseInt(departmentId, 10)]);

  console.table(result.rows);
}

// Function to delete a department
async function deleteDepartment() {
  const { departmentId } = await inquirer.prompt([
    { type: 'input', name: 'departmentId', message: 'Enter the Department ID to delete:' }
  ]);

  await client.query(`DELETE FROM department WHERE id = $1`, [parseInt(departmentId, 10)]);
  console.log("Department deleted successfully!");
}

// Function to delete a role
async function deleteRole() {
  const { roleId } = await inquirer.prompt([
    { type: 'input', name: 'roleId', message: 'Enter the Role ID to delete:' }
  ]);

  await client.query(`DELETE FROM role WHERE id = $1`, [parseInt(roleId, 10)]);
  console.log("Role deleted successfully!");
}

// Function to delete an employee
async function deleteEmployee() {
  const { employeeId } = await inquirer.prompt([
    { type: 'input', name: 'employeeId', message: 'Enter the Employee ID to delete:' }
  ]);

  await client.query(`DELETE FROM employee WHERE id = $1`, [parseInt(employeeId, 10)]);
  console.log("Employee deleted successfully!");
}

// Function to view total utilized budget by department
async function viewTotalBudgetByDepartment() {
  const { departmentId } = await inquirer.prompt([
    { type: 'input', name: 'departmentId', message: 'Enter the Department ID:' }
  ]);

  const result = await client.query(`
    SELECT d.name AS department, SUM(r.salary) AS total_budget
    FROM employee e
    LEFT JOIN role r ON e.role_id = r.id
    LEFT JOIN department d ON r.department_id = d.id
    WHERE d.id = $1
    GROUP BY d.name;
  `, [parseInt(departmentId, 10)]);

  console.table(result.rows);
}

// Function to view all roles
async function viewAllRoles() {
  const result = await client.query(`SELECT * FROM role`);
  console.table(result.rows);
}

// Function to add a role
async function addRole() {
  const { title, salary, departmentId } = await inquirer.prompt([
    { type: 'input', name: 'title', message: 'Role Title:' },
    { type: 'input', name: 'salary', message: 'Salary:' },
    { type: 'input', name: 'departmentId', message: 'Department ID:' }
  ]);

  await client.query(
    `INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)`,
    [title, salary, departmentId]
  );

  console.log("Role added successfully!");
}

// Function to view all departments
async function viewAllDepartments() {
  const result = await client.query(`SELECT * FROM department`);
  console.table(result.rows);
}

// Function to add a department
async function addDepartment() {
  const { name } = await inquirer.prompt([
    { type: 'input', name: 'name', message: 'Department Name:' }
  ]);

  await client.query(
    `INSERT INTO department (name) VALUES ($1)`,
    [name]
  );

  console.log("Department added successfully!");
}

// Start the application
async function main() {
  await connectDatabase();
  await showMainMenu();
}

main();





