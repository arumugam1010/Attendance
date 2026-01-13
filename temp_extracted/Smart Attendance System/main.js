
  // Global variables
  let capturedImage = "";
  let attendanceChart = null;
  const today = new Date().toISOString().split("T")[0];
  
  // Initialize the dashboard
  document.addEventListener('DOMContentLoaded', function() {
    // Set today's date
    document.getElementById('todayDate').textContent = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Initialize camera for registration
    initRegistrationCamera();
    
    // Initialize camera for attendance
    initAttendanceCamera();
    
    // Update counts
    updateCount();
    
    // Load students if on students page
    if (document.getElementById('students').classList.contains('active')) {
      loadAllStudents();
    }
    
    // Show section based on URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section');
    if (section) {
      showSection(section);
    }
    
    // Update department counts
    updateDepartmentCounts();
  });

  // Update department student counts
  function updateDepartmentCounts() {
    const students = JSON.parse(localStorage.getItem('students') || '{}');
    const depts = {
      'Computer Science': 0,
      'Information Technology': 0,
      'Electronics': 0,
      'Mechanical': 0,
      'Civil': 0
    };
    
    for (let key in students) {
      const dept = students[key].dept;
      if (depts.hasOwnProperty(dept)) {
        depts[dept]++;
      }
    }
    
    document.getElementById('cs-count').textContent = `${depts['Computer Science']} Students`;
    document.getElementById('it-count').textContent = `${depts['Information Technology']} Students`;
    document.getElementById('ece-count').textContent = `${depts['Electronics']} Students`;
    document.getElementById('mech-count').textContent = `${depts['Mechanical']} Students`;
    document.getElementById('civil-count').textContent = `${depts['Civil']} Students`;
  }

  // Show section function
  function showSection(id) {
    document.querySelectorAll('.section-content').forEach(sec => {
      sec.classList.remove('active');
    });
    document.getElementById(id).classList.add('active');
    
    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
      link.classList.remove('active');
    });
    
    event.target.classList.add('active');
    
    // Special actions for specific sections
    if (id === 'overview') {
      updateCount();
      initAttendanceChart();
    }
    if (id === 'students') loadAllStudents();
    if (id === 'register') initRegistrationCamera();
    if (id === 'attendance') initAttendanceCamera();
    if (id === 'departments') updateDepartmentCounts();
  }

  // Initialize registration camera
  function initRegistrationCamera() {
    const regVideo = document.getElementById('regVideo');
    if (regVideo) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          regVideo.srcObject = stream;
        })
        .catch(err => {
          console.error("Camera error: ", err);
          document.getElementById('regMsg').innerHTML = `
            <div class="alert alert-danger">
              <i class="fas fa-exclamation-triangle"></i> Camera access denied. Please enable camera permissions to register students.
            </div>
          `;
        });
    }
  }

  // Initialize attendance camera
  function initAttendanceCamera() {
    const video = document.getElementById('video');
    if (video) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          video.srcObject = stream;
        })
        .catch(err => {
          console.error("Camera error: ", err);
          document.getElementById('attendanceResult').innerHTML = `
            <div class="alert alert-danger">
              <i class="fas fa-exclamation-triangle"></i> Camera access denied. Please enable camera permissions to mark attendance.
            </div>
          `;
        });
    }
  }

  // Capture face for registration
  function captureFace() {
    const regVideo = document.getElementById('regVideo');
    const regCanvas = document.getElementById('regCanvas');
    const previewFace = document.getElementById('previewFace');
    
    if (!regVideo.srcObject) {
      document.getElementById('regMsg').innerHTML = `
        <div class="alert alert-danger no-face-alert">
          <i class="fas fa-exclamation-triangle"></i> Camera not available. Please check permissions.
        </div>
      `;
      return;
    }
    
    const ctx = regCanvas.getContext('2d');
    ctx.drawImage(regVideo, 0, 0, regCanvas.width, regCanvas.height);
    capturedImage = regCanvas.toDataURL('image/png');
    
    previewFace.innerHTML = `
      <div class="d-flex justify-content-center">
        <img src="${capturedImage}" class="face-preview shadow" />
      </div>
      <div class="text-center mt-2 text-success">
        <i class="fas fa-check-circle"></i> Face captured successfully
      </div>
    `;
  }

  // Register student
  function registerStudent(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const dept = document.getElementById('dept').value.trim();
    const year = document.getElementById('year').value.trim();
    const dob = document.getElementById('dob').value;
    const regMsg = document.getElementById('regMsg');
    
    // Validate form
    if (!name || !dept || !year || !dob) {
      regMsg.innerHTML = `
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-triangle"></i> Please fill all required fields.
        </div>
      `;
      return;
    }
    
    if (!capturedImage) {
      regMsg.innerHTML = `
        <div class="alert alert-danger no-face-alert">
          <i class="fas fa-exclamation-triangle"></i> Please capture the student's face before registering.
        </div>
      `;
      return;
    }
    
    // Create student key
    const key = `${name.toLowerCase()}|${dept.toLowerCase()}|${dob}`;
    let students = JSON.parse(localStorage.getItem('students') || {});
    
    // Check if student already exists
    if (students[key]) {
      regMsg.innerHTML = `
        <div class="alert alert-warning">
          <i class="fas fa-exclamation-circle"></i> Student already registered!
        </div>
      `;
      return;
    }
    
    // Register new student
    students[key] = { name, dept, year, dob, face: capturedImage };
    localStorage.setItem('students', JSON.stringify(students));
    
    // Show success message
    regMsg.innerHTML = `
      <div class="alert alert-success">
        <i class="fas fa-check-circle"></i> Student registered successfully!
      </div>
    `;
    
    // Reset form
    document.getElementById('regForm').reset();
    document.getElementById('previewFace').innerHTML = '';
    capturedImage = '';
    
    // Update counts
    updateCount();
    updateDepartmentCounts();
    
    // Reload students list if on that page
    if (document.getElementById('students').classList.contains('active')) {
      loadAllStudents();
    }
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      regMsg.innerHTML = '';
    }, 3000);
  }

  // Mark today's attendance
function markTodayAttendance() {
  const students = JSON.parse(localStorage.getItem('students') || '{}');
  const attendanceResult = document.getElementById('attendanceResult');
  
  // Check if any students are registered
  if (Object.keys(students).length === 0) {
    attendanceResult.innerHTML = `
      <div class="alert alert-warning">
        <i class="fas fa-exclamation-circle"></i> No students registered yet. Please register students first.
      </div>
    `;
    return;
  }
  
  // Check if camera is available
  const video = document.getElementById('video');
  if (!video.srcObject) {
    attendanceResult.innerHTML = `
      <div class="alert alert-danger no-face-alert">
        <i class="fas fa-exclamation-triangle"></i> Camera not available. Please check permissions.
      </div>
    `;
    return;
  }
  
  // Get existing attendance for today
  const allRecords = JSON.parse(localStorage.getItem('attendanceRecords') || {});
  const todayAttendance = allRecords[today] || {};
  
  // For demo purposes, we'll toggle the status of each student
  // In a real app, this would use actual face recognition
  const updatedAttendance = {};
  let presentCount = 0;
  
  for (let key in students) {
    // Toggle status - if previously present, mark absent, and vice versa
    if (todayAttendance[key] === 'present') {
      updatedAttendance[key] = 'absent';
    } else {
      updatedAttendance[key] = 'present';
      presentCount++;
    }
  }
  
  // Save updated attendance
  allRecords[today] = updatedAttendance;
  localStorage.setItem('attendanceRecords', JSON.stringify(allRecords));
  
  // Show result
  attendanceResult.innerHTML = `
    <div class="alert alert-success">
      <i class="fas fa-check-circle"></i> Attendance marked successfully!
    </div>
    <div class="card mt-3">
      <div class="card-body">
        <h5><i class="fas fa-clipboard-list"></i> Attendance Summary</h5>
        <p>Present: ${presentCount} students</p>
        <p>Absent: ${Object.keys(students).length - presentCount} students</p>
        <div class="progress mt-2" style="height: 20px;">
          <div class="progress-bar bg-success" style="width: ${(presentCount / Object.keys(students).length) * 100}%">
            ${Math.round((presentCount / Object.keys(students).length) * 100)}%
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Update counts
  updateCount();
}
  // Show department students
  function showDepartmentStudents(deptName) {
    const students = JSON.parse(localStorage.getItem('students') || '{}');
    const todayAttendance = JSON.parse(localStorage.getItem('attendanceRecords') || '{}')[today] || {};
    
    // Filter students of selected department
    const filtered = Object.entries(students).filter(([_, s]) => s.dept === deptName);
    
    document.getElementById('selectedDeptName').textContent = deptName;
    const listEl = document.getElementById('studentList');
    listEl.innerHTML = '';
    
    if (filtered.length === 0) {
      listEl.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-muted py-4">
            <i class="fas fa-user-slash fa-2x mb-2"></i><br>
            No students registered in this department.
          </td>
        </tr>
      `;
    } else {
      filtered.forEach(([key, s], idx) => {
        const status = todayAttendance[key] === 'present' ? 'Present' : 'Absent';
        const badgeClass = todayAttendance[key] === 'present' ? 'badge-present' : 'badge-absent';
        const faceImg = s.face ? `<img src="${s.face}" width="50" class="rounded-circle">` : '<i class="fas fa-user-slash text-muted"></i>';
        
        listEl.innerHTML += `
          <tr>
            <td>${idx + 1}</td>
            <td>${s.name}</td>
            <td>${s.year}</td>
            <td>${s.dob}</td>
            <td>${faceImg}</td>
            <td><span class="badge ${badgeClass}">${status}</span></td>
          </tr>
        `;
      });
    }
    
    document.getElementById('deptStudentList').style.display = 'block';
    document.getElementById('deptStudentList').scrollIntoView({ behavior: 'smooth' });
  }

  // Load all students with filtering
  function loadAllStudents() {
    const students = JSON.parse(localStorage.getItem('students') || '{}');
    const tbody = document.getElementById('studentTableBody');
    tbody.innerHTML = '';
    
    if (Object.keys(students).length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center text-muted py-4">
            <i class="fas fa-user-slash fa-2x mb-2"></i><br>
            No students registered yet.
          </td>
        </tr>
      `;
      return;
    }
    
    filterStudents(); // Apply any existing filters
  }

  // Filter students based on criteria
  function filterStudents() {
    const deptFilter = document.getElementById('filterDept').value.toLowerCase();
    const yearFilter = document.getElementById('filterYear').value.toLowerCase();
    const nameFilter = document.getElementById('filterName').value.toLowerCase();
    
    const students = JSON.parse(localStorage.getItem('students') || '{}');
    const tbody = document.getElementById('studentTableBody');
    tbody.innerHTML = '';
    
    let i = 1;
    for (let key in students) {
      const s = students[key];
      const matchesDept = !deptFilter || s.dept.toLowerCase() === deptFilter;
      const matchesYear = !yearFilter || s.year.toLowerCase() === yearFilter;
      const matchesName = !nameFilter || s.name.toLowerCase().includes(nameFilter);
      
      if (matchesDept && matchesYear && matchesName) {
        const imgTag = s.face ? `<img src="${s.face}" width="50" class="rounded-circle">` : '<i class="fas fa-user-slash text-muted"></i>';
        tbody.innerHTML += `
          <tr>
            <td>${i++}</td>
            <td>${s.name}</td>
            <td>${s.dept}</td>
            <td>${s.year}</td>
            <td>${s.dob}</td>
            <td>${imgTag}</td>
            <td>
              <button class="btn btn-sm btn-outline-danger" onclick="deleteStudent('${key}')">
                <i class="fas fa-trash-alt"></i> Delete
              </button>
            </td>
          </tr>
        `;
      }
    }
    
    if (tbody.innerHTML === '') {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center text-muted py-4">
            <i class="fas fa-search fa-2x mb-2"></i><br>
            No students match your filters.
          </td>
        </tr>
      `;
    }
  }

  // Delete a student
  function deleteStudent(key) {
    if (confirm('Are you sure you want to delete this student?')) {
      let students = JSON.parse(localStorage.getItem('students') || '{}');
      delete students[key];
      localStorage.setItem('students', JSON.stringify(students));
      
      // Show toast notification
      const toast = document.createElement('div');
      toast.className = 'position-fixed bottom-0 end-0 p-3';
      toast.style.zIndex = '11';
      toast.innerHTML = `
        <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
          <div class="toast-header bg-danger text-white">
            <strong class="me-auto">Deleted</strong>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close" onclick="this.parentElement.parentElement.remove()"></button>
          </div>
          <div class="toast-body">
            Student record deleted successfully.
          </div>
        </div>
      `;
      document.body.appendChild(toast);
      
      // Remove toast after 3 seconds
      setTimeout(() => {
        toast.remove();
      }, 3000);
      
      // Refresh views
      loadAllStudents();
      updateCount();
    }
  }

  // Confirm delete all students
  function confirmDeleteAll() {
    if (confirm('Are you sure you want to delete ALL students? This cannot be undone!')) {
      localStorage.removeItem('students');
      
      // Show toast notification
      const toast = document.createElement('div');
      toast.className = 'position-fixed bottom-0 end-0 p-3';
      toast.style.zIndex = '11';
      toast.innerHTML = `
        <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
          <div class="toast-header bg-danger text-white">
            <strong class="me-auto">Deleted All</strong>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close" onclick="this.parentElement.parentElement.remove()"></button>
          </div>
          <div class="toast-body">
            All student records have been deleted.
          </div>
        </div>
      `;
      document.body.appendChild(toast);
      
      // Remove toast after 3 seconds
      setTimeout(() => {
        toast.remove();
      }, 3000);
      
      // Refresh views
      loadAllStudents();
      updateCount();
    }
  }

  // Update counts in overview
  function updateCount() {
    const students = JSON.parse(localStorage.getItem('students') || '{}');
    const total = Object.keys(students).length;
    document.getElementById('totalCount').textContent = total;
    
    const todayAttendance = JSON.parse(localStorage.getItem('attendanceRecords') || '{}')[today] || {};
    
    let present = 0;
    let absent = 0;
    
    for (let key in students) {
      if (todayAttendance[key] === 'present') present++;
      else absent++;
    }
    
    document.getElementById('presentCount').textContent = present;
    document.getElementById('absentCount').textContent = absent;
  }

  // Initialize attendance chart
  function initAttendanceChart() {
    const ctx = document.getElementById('attendanceChart').getContext('2d');
    
    // Get attendance data for last 7 days
    const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords') )|| {};
    const dates = Object.keys(attendanceRecords).sort().slice(-7);
    const presentData = [];
    const absentData = [];
    const students = JSON.parse(localStorage.getItem('students') || '{}');
    const totalStudents = Object.keys(students).length;
    
    dates.forEach(date => {
      const record = attendanceRecords[date];
      let present = 0;
      
      for (let key in record) {
        if (record[key] === 'present') present++;
      }
      
      presentData.push(present);
      absentData.push(totalStudents - present);
    });
    
    // Format dates for display
    const formattedDates = dates.map(date => {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    // Destroy previous chart if exists
    if (attendanceChart) {
      attendanceChart.destroy();
    }
    
    // Create new chart
    attendanceChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: formattedDates,
        datasets: [
          {
            label: 'Present',
            data: presentData,
            borderColor: '#2ecc71',
            backgroundColor: 'rgba(46, 204, 113, 0.1)',
            tension: 0.3,
            fill: true
          },
          {
            label: 'Absent',
            data: absentData,
            borderColor: '#e74c3c',
            backgroundColor: 'rgba(231, 76, 60, 0.1)',
            tension: 0.3,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Attendance Trends (Last 7 Days)'
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            suggestedMax: totalStudents > 0 ? totalStudents : 10
          }
        }
      }
    });
  }
