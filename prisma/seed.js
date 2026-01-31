const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

async function main() {
  await prisma.reviewResponse.deleteMany();
  await prisma.review.deleteMany();
  await prisma.material.deleteMany();
  await prisma.reviewView.deleteMany();
  await prisma.materialView.deleteMany();
  await prisma.materialSave.deleteMany();
  await prisma.savedCourse.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.scheduleEntry.deleteMany();
  await prisma.userFollow.deleteMany();
  await prisma.course.deleteMany();
  await prisma.tagOnProfessor.deleteMany();
  await prisma.departmentOnProfessor.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.userSchool.deleteMany();
  await prisma.department.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.school.deleteMany();
  await prisma.user.deleteMany();

  const schoolNames = [
    "North Ridge University",
    "Pacific Technical Institute",
    "Metro City College",
    "Summit State University",
    "Coastal Valley College",
    "Lakeview University",
    "Pioneer State College",
    "Cedar Grove Institute",
    "Redwood Valley University",
    "Brighton City College"
  ];
  const schoolCount = 25;
  const schoolsData = [];
  for (let i = 0; i < schoolCount; i += 1) {
    const name =
      schoolNames[i] ?? `Riverbend University ${i - schoolNames.length + 1}`;
    schoolsData.push({ name, slug: slugify(name) });
  }
  await prisma.school.createMany({ data: schoolsData });

  const schoolRecords = await prisma.school.findMany({ orderBy: { name: "asc" } });

  const departmentsData = [];
  for (const school of schoolRecords) {
    const base = [
      "Computer Science",
      "Mathematics",
      "History",
      "Biology",
      "Economics",
      "Psychology"
    ];
    base.forEach((name) => {
      departmentsData.push({
        name,
        slug: slugify(name),
        schoolId: school.id
      });
    });
  }
  await prisma.department.createMany({ data: departmentsData });
  const departments = await prisma.department.findMany();

  const tagNames = [
    "Clear explanations",
    "Tough grader",
    "Engaging lectures",
    "Fair exams",
    "Project heavy",
    "Accessible office hours",
    "Lots of homework",
    "Participation matters",
    "Generous curves",
    "Practical examples",
    "Fast feedback",
    "Heavy readings",
    "Group projects",
    "Bonus opportunities",
    "Great slides",
    "Attendance required",
    "Flipped classroom",
    "Hands-on labs",
    "Case studies",
    "Guest speakers",
    "Open book exams",
    "Tough but fair",
    "Strict deadlines",
    "Real-world focus",
    "Flexible grading"
  ];
  await prisma.tag.createMany({
    data: tagNames.map((name) => ({ name, slug: slugify(name) }))
  });
  const tags = await prisma.tag.findMany();

  const professorFirstNames = [
    "Elaine",
    "Mateo",
    "Sora",
    "Adaeze",
    "Linh",
    "Trevor",
    "Avery",
    "Noah",
    "Priya",
    "Harper",
    "Julian",
    "Camila",
    "Elias",
    "Nina",
    "Jordan"
  ];
  const professorLastNames = [
    "Chen",
    "Rodriguez",
    "Kim",
    "Okafor",
    "Nguyen",
    "Mason",
    "Patel",
    "Brooks",
    "Garcia",
    "Hughes",
    "Martinez",
    "Singh",
    "Reed",
    "Foster",
    "Alvarez"
  ];
  const professorCount = 120;
  const crypto = require("crypto");
  const createPasswordHash = (password) => {
    const salt = crypto.randomBytes(16).toString("hex");
    const derived = crypto.scryptSync(password, salt, 64).toString("hex");
    return `${salt}:${derived}`;
  };
  const passwordHash = createPasswordHash("password123");
  const professorsData = [];
  for (let i = 0; i < professorCount; i += 1) {
    const firstName = professorFirstNames[i % professorFirstNames.length];
    const lastName =
      professorLastNames[Math.floor(i / professorFirstNames.length) % professorLastNames.length];
    professorsData.push({
      email: `prof.${i + 1}@classrack.dev`,
      name: `Dr. ${firstName} ${lastName}`,
      passwordHash,
      theme: "LIGHT",
      role: "PROFESSOR"
    });
  }

  await prisma.user.createMany({ data: professorsData });
  const professorRecords = await prisma.user.findMany({
    where: { role: "PROFESSOR" },
    orderBy: { name: "asc" }
  });

  const studentFirstNames = [
    "Ava",
    "Malik",
    "Sofia",
    "Owen",
    "Isla",
    "Jayden",
    "Noah",
    "Mira",
    "Aria",
    "Leo",
    "Maya",
    "Caleb",
    "Nora",
    "Miles",
    "Ivy"
  ];
  const studentLastNames = [
    "Jordan",
    "Turner",
    "Patel",
    "Brooks",
    "Reed",
    "Park",
    "Diaz",
    "Hassan",
    "Carter",
    "Ng",
    "Morgan",
    "Price",
    "Young",
    "Bennett",
    "Flores"
  ];
  const majors = [
    "Computer Science",
    "Biology",
    "Economics",
    "Psychology",
    "Mathematics",
    "History",
    "Business",
    "Engineering",
    "Data Science",
    "Political Science"
  ];
  const yearOptions = ["2025", "2026", "2027", "2028", "2029"];
  const studentCount = 60;
  const studentsData = [];
  for (let i = 0; i < studentCount; i += 1) {
    const firstName = studentFirstNames[i % studentFirstNames.length];
    const lastName =
      studentLastNames[Math.floor(i / studentFirstNames.length) % studentLastNames.length];
    studentsData.push({
      email: `student.${i + 1}@classrack.dev`,
      name: `${firstName} ${lastName}`,
      major: majors[i % majors.length],
      year: yearOptions[i % yearOptions.length],
      passwordHash,
      theme: "LIGHT",
      role: "STUDENT"
    });
  }
  await prisma.user.createMany({ data: studentsData });
  const studentRecords = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { name: "asc" }
  });

  const followData = [];
  professorRecords.slice(0, 30).forEach((professor, index) => {
    const student = studentRecords[index % studentRecords.length];
    followData.push({ followerId: student.id, followingId: professor.id });
  });
  studentRecords.slice(0, 20).forEach((student, index) => {
    const otherStudent = studentRecords[(index + 5) % studentRecords.length];
    followData.push({ followerId: student.id, followingId: otherStudent.id });
  });
  if (followData.length > 0) {
    await prisma.userFollow.createMany({ data: followData, skipDuplicates: true });
  }

  const userSchoolsData = [];
  for (const professor of professorRecords) {
    const school = schoolRecords[Math.floor(Math.random() * schoolRecords.length)];
    userSchoolsData.push({ userId: professor.id, schoolId: school.id, role: "PROFESSOR" });
  }
  for (const student of studentRecords) {
    const school = schoolRecords[Math.floor(Math.random() * schoolRecords.length)];
    userSchoolsData.push({ userId: student.id, schoolId: school.id, role: "STUDENT" });
  }
  await prisma.userSchool.createMany({ data: userSchoolsData });

  const departmentAssignments = [];
  for (const professor of professorRecords) {
    const shuffledDepartments = [...departments].sort(() => 0.5 - Math.random()).slice(0, 2);
    shuffledDepartments.forEach((department) => {
      departmentAssignments.push({
        professorId: professor.id,
        departmentId: department.id
      });
    });
  }
  await prisma.departmentOnProfessor.createMany({ data: departmentAssignments });

  const tagAssignments = [];
  for (const professor of professorRecords) {
    const shuffled = [...tags].sort(() => 0.5 - Math.random()).slice(0, 3);
    shuffled.forEach((tag) => {
      tagAssignments.push({ professorId: professor.id, tagId: tag.id });
    });
  }
  await prisma.tagOnProfessor.createMany({ data: tagAssignments });

  const coursesData = [];
  professorRecords.forEach((professor, index) => {
    const school = schoolRecords[index % schoolRecords.length];
    coursesData.push({
      name: "Introduction to Data Systems",
      courseNumber: `CS-${100 + index}`,
      schoolId: school.id,
      professorId: professor.id
    });
    coursesData.push({
      name: "Applied Analytics",
      courseNumber: `AN-${200 + index}`,
      schoolId: school.id,
      professorId: professor.id
    });
  });
  await prisma.course.createMany({ data: coursesData });
  const courseRecords = await prisma.course.findMany({ orderBy: { courseNumber: "asc" } });

  const materialsData = [];
  const materialTemplates = [
    {
      title: "Exam prep guide",
      content:
        "Key topics, practice prompts, and a checklist for midterm readiness. Includes sample questions and pacing tips."
    },
    {
      title: "Lecture notes pack",
      content:
        "Concise lecture notes with summaries, definitions, and quick examples pulled from weekly topics."
    },
    {
      title: "Project rubric + tips",
      content:
        "Rubric highlights, common pitfalls, and a breakdown of how to structure your final project."
    }
  ];
  professorRecords.slice(0, 18).forEach((professor, index) => {
    const template = materialTemplates[index % materialTemplates.length];
    const uploader = studentRecords[index % studentRecords.length];
    const course = courseRecords[index * 2] ?? null;
    materialsData.push({
      title: template.title,
      content: template.content,
      professorId: professor.id,
      uploaderId: uploader.id,
      courseId: course ? course.id : null,
      term: "Fall 2026",
      status: index % 4 === 0 ? "APPROVED" : "PENDING"
    });
    materialsData.push({
      title: `${template.title} (supplement)`,
      content:
        "Additional practice items, sample outlines, and a short study plan for the final stretch.",
      professorId: professor.id,
      uploaderId: uploader.id,
      courseId: course ? course.id : null,
      term: "Fall 2026",
      status: "APPROVED"
    });
  });
  if (materialsData.length > 0) {
    await prisma.material.createMany({ data: materialsData });
  }

  const materialRecords = await prisma.material.findMany({ orderBy: { createdAt: "desc" } });
  const materialViews = [];
  const materialSaves = [];
  materialRecords.slice(0, 20).forEach((material, index) => {
    const viewer = studentRecords[index % studentRecords.length];
    materialViews.push({
      materialId: material.id,
      viewerId: viewer.id,
      viewedOn: new Date(new Date().toDateString())
    });
    if (index % 2 === 0) {
      materialSaves.push({ materialId: material.id, userId: viewer.id });
    }
  });
  if (materialViews.length > 0) {
    await prisma.materialView.createMany({ data: materialViews, skipDuplicates: true });
  }
  if (materialSaves.length > 0) {
    await prisma.materialSave.createMany({ data: materialSaves, skipDuplicates: true });
  }

  const scheduleEntries = [];
  studentRecords.slice(0, 10).forEach((student, index) => {
    const course = courseRecords[index % courseRecords.length];
    scheduleEntries.push({
      userId: student.id,
      courseId: course.id,
      term: "Fall 2026",
      meetingTimes: "MW 10:00–11:15"
    });
  });
  if (scheduleEntries.length > 0) {
    await prisma.scheduleEntry.createMany({ data: scheduleEntries, skipDuplicates: true });
  }

  const savedCourseData = [];
  studentRecords.slice(0, 10).forEach((student, index) => {
    const course = courseRecords[(index + 5) % courseRecords.length];
    savedCourseData.push({ userId: student.id, courseId: course.id });
  });
  if (savedCourseData.length > 0) {
    await prisma.savedCourse.createMany({ data: savedCourseData, skipDuplicates: true });
  }

  const notificationData = [];
  studentRecords.slice(0, 12).forEach((student, index) => {
    notificationData.push({
      userId: student.id,
      message: index % 2 === 0 ? "New upload added for ECON 101." : "Your upload got new saves."
    });
  });
  if (notificationData.length > 0) {
    await prisma.notification.createMany({ data: notificationData });
  }

  const reviewsData = [];
  const reviewResponsesData = [];
  let reviewCounter = 0;

  const gradeOptions = ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"];
  for (const student of studentRecords) {
    const professor = professorRecords[reviewCounter % professorRecords.length];
    const rating = (reviewCounter % 5) + 1;
    reviewsData.push({
      rating,
      difficulty: Math.min(5, Math.max(1, rating + 1)),
      expertise: Math.min(5, Math.max(1, rating + 0)),
      enjoyability: Math.min(5, Math.max(1, rating - 1)),
      clarity: Math.min(5, Math.max(1, rating + 0)),
      body: "Clear structure with helpful feedback and relevant examples.",
      helpfulUp: Math.floor(Math.random() * 12),
      helpfulDown: Math.floor(Math.random() * 4),
      wouldTakeAgain: Math.random() > 0.35,
      forCredit: Math.random() > 0.2,
      attendanceMandatory: Math.random() > 0.5,
      textbookRequired: Math.random() > 0.55,
      onlineClass: Math.random() > 0.7,
      grade: gradeOptions[Math.floor(Math.random() * gradeOptions.length)],
      studentId: student.id,
      professorId: professor.id
    });
    reviewCounter += 1;
  }

  const createdReviews = [];
  for (const reviewData of reviewsData) {
    const created = await prisma.review.create({ data: reviewData });
    createdReviews.push(created);
  }

  createdReviews.slice(0, 25).forEach((review) => {
    const professor = professorRecords.find((prof) => prof.id === review.professorId);
    if (!professor) return;
    reviewResponsesData.push({
      body: "Thanks for the thoughtful feedback. I have updated the assignments based on this.",
      reviewId: review.id,
      professorId: professor.id
    });
  });

  if (reviewResponsesData.length > 0) {
    await prisma.reviewResponse.createMany({ data: reviewResponsesData });
  }

  const reviewViews = [];
  createdReviews.slice(0, 20).forEach((review, index) => {
    const viewer = studentRecords[(index + 3) % studentRecords.length];
    reviewViews.push({
      reviewId: review.id,
      viewerId: viewer.id,
      viewedOn: new Date(new Date().toDateString())
    });
  });
  if (reviewViews.length > 0) {
    await prisma.reviewView.createMany({ data: reviewViews, skipDuplicates: true });
  }

  const schoolReviewsData = [];
  const ratingValue = () => Math.floor(Math.random() * 5) + 1;
  for (const student of studentRecords) {
    const school = schoolRecords[Math.floor(Math.random() * schoolRecords.length)];
    schoolReviewsData.push({
      overall: ratingValue(),
      reputation: ratingValue(),
      opportunities: ratingValue(),
      clubs: ratingValue(),
      safety: ratingValue(),
      location: ratingValue(),
      facilities: ratingValue(),
      happiness: ratingValue(),
      internet: ratingValue(),
      food: ratingValue(),
      social: ratingValue(),
      body: "Great campus community with supportive resources and engaging events.",
      helpfulUp: Math.floor(Math.random() * 10),
      helpfulDown: Math.floor(Math.random() * 3),
      studentId: student.id,
      schoolId: school.id
    });
  }

  if (schoolReviewsData.length > 0) {
    await prisma.schoolReview.createMany({ data: schoolReviewsData });
  }

  const accountData = [];
  const sessionData = [];
  const verificationTokenData = [];
  const allUsers = [...professorRecords, ...studentRecords];

  allUsers.slice(0, 25).forEach((user, index) => {
    accountData.push({
      userId: user.id,
      type: "credentials",
      provider: "credentials",
      providerAccountId: `user-${index + 1}`
    });
    sessionData.push({
      sessionToken: `session-${index + 1}`,
      userId: user.id,
      expires: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000)
    });
    verificationTokenData.push({
      identifier: `verify-${index + 1}@classrack.dev`,
      token: `token-${index + 1}`,
      expires: new Date(Date.now() + (index + 2) * 24 * 60 * 60 * 1000)
    });
  });

  await prisma.account.createMany({ data: accountData });
  await prisma.session.createMany({ data: sessionData });
  await prisma.verificationToken.createMany({ data: verificationTokenData });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
