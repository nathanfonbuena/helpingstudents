const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

const prisma = new PrismaClient();

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const createPasswordHash = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
};

// Random int between min and max inclusive
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Random date between two dates
const randDate = (start, end) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

// Diverse review bodies: positive, mixed, negative
const positiveReviewBodies = [
  "One of the best professors I've had. Lectures are engaging, office hours are genuinely helpful, and feedback is timely. Highly recommend.",
  "Explains concepts clearly and connects theory to real-world applications. Exams are tough but fair if you attend class.",
  "Very knowledgeable and genuinely cares about student success. Goes out of their way to make difficult material accessible.",
  "Organized, approachable, and passionate about the subject. Assignments were challenging but prepared me well for the final.",
  "Made a notoriously hard subject actually enjoyable. Clear rubrics, honest feedback, and always available on email.",
  "Great professor — sets high expectations but gives you the tools to meet them. The lab sessions made everything click.",
  "Lectures are well-structured and slides are always posted ahead of time. Tests reflect what's taught in class.",
  "Really supportive instructor. If you put in the effort, they will too. One of the most rewarding courses I've taken.",
  "Exceptional at breaking down complex topics. The quizzes throughout the semester kept me on track.",
  "Made office hours feel welcoming, not intimidating. Returned graded work within a week consistently."
];

const mixedReviewBodies = [
  "Knows the material deeply but can rush through difficult topics. Worth attending every lecture to keep up.",
  "Interesting course content, but grading can feel inconsistent. Check the rubric carefully before submitting.",
  "Some lectures are excellent, others feel disorganized. The readings are dense but relevant.",
  "Good professor overall, just not super available outside class. Office hours book up fast.",
  "Assignments are creative and thoughtful, but workload is heavier than expected. Manage your time.",
  "Solid lectures, but the midterm was harder than the material suggested. Make sure to review past exams.",
  "Teaching style takes getting used to but pays off by the end of the semester. Stick with it.",
  "Very knowledgeable, though sometimes assumes more background than students have. Ask questions early.",
  "Classroom energy is good, but the grading policy for participation felt vague. Clarify that early.",
  "Decent course overall. Professor is fair but the workload peaks around week 8 — plan ahead."
];

const negativeReviewBodies = [
  "Lectures were hard to follow and slides weren't posted until after class. Ended up mostly self-studying.",
  "Grading felt arbitrary at times and feedback on assignments was minimal. Hard to know how to improve.",
  "Not the most engaging teaching style. Material is important but delivery made it hard to stay focused.",
  "Office hours were rarely available and emails took days to get a response. That made the course harder.",
  "Tests covered material not discussed in lecture. Felt like I was being set up to fail.",
  "The pace of the course was too fast and there wasn't enough support for students who struggled early on.",
  "Expectations weren't clearly communicated at the start. Had to figure out what was graded how by trial and error.",
  "Not bad, just very by-the-book. Could benefit from more real-world examples and interactive exercises.",
  "The course structure changed mid-semester without much notice. That threw off a lot of students.",
  "Professor is clearly an expert but doesn't always translate expertise into clear explanations for beginners."
];

const allReviewBodies = [...positiveReviewBodies, ...mixedReviewBodies, ...negativeReviewBodies];

// .edu domains for verified students
const eduDomains = [
  "mit.edu", "stanford.edu", "uchicago.edu", "columbia.edu", "yale.edu",
  "cornell.edu", "nyu.edu", "georgetown.edu", "unc.edu", "purdue.edu",
  "gatech.edu", "usc.edu", "bu.edu", "northeastern.edu", "tufts.edu"
];

// .com domains for unverified students
const comDomains = [
  "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com",
  "protonmail.com", "aol.com", "zoho.com"
];

async function main() {
  // ── Cleanup ──────────────────────────────────────────────────────────────────
  // Delete dependent records before parent rows to avoid FK violations when reseeding.
  await prisma.courseMetadata.deleteMany();
  await prisma.reviewSummary.deleteMany();
  await prisma.professorProfile.deleteMany();
  await prisma.verificationStatus.deleteMany();
  await prisma.reviewView.deleteMany();
  await prisma.reviewVote.deleteMany();
  await prisma.reviewResponse.deleteMany();
  await prisma.schoolReviewVote.deleteMany();
  await prisma.schoolReview.deleteMany();
  await prisma.review.deleteMany();
  await prisma.materialView.deleteMany();
  await prisma.materialSave.deleteMany();
  await prisma.material.deleteMany();
  await prisma.professorProfileView.deleteMany();
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

  // ── Schools ───────────────────────────────────────────────────────────────────
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

  // ── Departments ───────────────────────────────────────────────────────────────
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
      departmentsData.push({ name, slug: slugify(name), schoolId: school.id });
    });
  }
  await prisma.department.createMany({ data: departmentsData });
  const departments = await prisma.department.findMany();

  // ── Tags ──────────────────────────────────────────────────────────────────────
  const tagNames = [
    "Clear explanations", "Tough grader", "Engaging lectures", "Fair exams",
    "Project heavy", "Accessible office hours", "Lots of homework",
    "Participation matters", "Generous curves", "Practical examples",
    "Fast feedback", "Heavy readings", "Group projects", "Bonus opportunities",
    "Great slides", "Attendance required", "Flipped classroom", "Hands-on labs",
    "Case studies", "Guest speakers", "Open book exams", "Tough but fair",
    "Strict deadlines", "Real-world focus", "Flexible grading"
  ];
  await prisma.tag.createMany({
    data: tagNames.map((name) => ({ name, slug: slugify(name) }))
  });
  const tags = await prisma.tag.findMany();

  // ── Professors ────────────────────────────────────────────────────────────────
  const professorFirstNames = [
    "Elaine", "Mateo", "Sora", "Adaeze", "Linh", "Trevor", "Avery",
    "Noah", "Priya", "Harper", "Julian", "Camila", "Elias", "Nina", "Jordan"
  ];
  const professorLastNames = [
    "Chen", "Rodriguez", "Kim", "Okafor", "Nguyen", "Mason", "Patel",
    "Brooks", "Garcia", "Hughes", "Martinez", "Singh", "Reed", "Foster", "Alvarez"
  ];
  const professorCount = 120;
  const passwordHash = createPasswordHash("password123");
  const professorsData = [];
  for (let i = 0; i < professorCount; i += 1) {
    const firstName = professorFirstNames[i % professorFirstNames.length];
    const lastName =
      professorLastNames[Math.floor(i / professorFirstNames.length) % professorLastNames.length];
    const name = `Dr. ${firstName} ${lastName}`;
    professorsData.push({
      email: `prof.${i + 1}@classrack.dev`,
      name,
      slug: slugify(name),
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

  // ── Students: 60 with .edu (verified) + 60 with .com (unverified) ─────────────
  const studentFirstNames = [
    "Ava", "Malik", "Sofia", "Owen", "Isla", "Jayden", "Noah", "Mira",
    "Aria", "Leo", "Maya", "Caleb", "Nora", "Miles", "Ivy"
  ];
  const studentLastNames = [
    "Jordan", "Turner", "Patel", "Brooks", "Reed", "Park", "Diaz", "Hassan",
    "Carter", "Ng", "Morgan", "Price", "Young", "Bennett", "Flores"
  ];
  const majors = [
    "Computer Science", "Biology", "Economics", "Psychology", "Mathematics",
    "History", "Business", "Engineering", "Data Science", "Political Science"
  ];
  const yearOptions = ["2025", "2026", "2027", "2028", "2029"];

  const studentsData = [];

  // 60 .edu students (will get verified)
  for (let i = 0; i < 60; i += 1) {
    const firstName = studentFirstNames[i % studentFirstNames.length];
    const lastName =
      studentLastNames[Math.floor(i / studentFirstNames.length) % studentLastNames.length];
    const domain = eduDomains[i % eduDomains.length];
    studentsData.push({
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i + 1}@${domain}`,
      name: `${firstName} ${lastName}`,
      major: majors[i % majors.length],
      year: yearOptions[i % yearOptions.length],
      passwordHash,
      theme: "LIGHT",
      role: "STUDENT",
      verified: true // .edu students are pre-verified in seed
    });
  }

  // 60 .com students (unverified)
  for (let i = 0; i < 60; i += 1) {
    const firstName = studentFirstNames[(i + 5) % studentFirstNames.length];
    const lastName =
      studentLastNames[Math.floor((i + 3) / studentFirstNames.length) % studentLastNames.length];
    const domain = comDomains[i % comDomains.length];
    studentsData.push({
      email: `${firstName.toLowerCase()}${lastName.toLowerCase()}${i + 100}@${domain}`,
      name: `${firstName} ${lastName}`,
      major: majors[(i + 3) % majors.length],
      year: yearOptions[(i + 2) % yearOptions.length],
      passwordHash,
      theme: "LIGHT",
      role: "STUDENT",
      verified: false
    });
  }

  await prisma.user.createMany({ data: studentsData });
  const studentRecords = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { createdAt: "asc" }
  });
  const eduStudents = studentRecords.filter((s) => s.verified);
  const comStudents = studentRecords.filter((s) => !s.verified);

  // ── Follow data ───────────────────────────────────────────────────────────────
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

  // ── User–School assignments ───────────────────────────────────────────────────
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

  // ── Department assignments ────────────────────────────────────────────────────
  const departmentAssignments = [];
  for (const professor of professorRecords) {
    const shuffledDepartments = [...departments].sort(() => 0.5 - Math.random()).slice(0, 2);
    shuffledDepartments.forEach((department) => {
      departmentAssignments.push({ professorId: professor.id, departmentId: department.id });
    });
  }
  await prisma.departmentOnProfessor.createMany({ data: departmentAssignments });

  // ── Tag assignments ───────────────────────────────────────────────────────────
  const tagAssignments = [];
  for (const professor of professorRecords) {
    const shuffled = [...tags].sort(() => 0.5 - Math.random()).slice(0, 3);
    shuffled.forEach((tag) => {
      tagAssignments.push({ professorId: professor.id, tagId: tag.id });
    });
  }
  await prisma.tagOnProfessor.createMany({ data: tagAssignments });

  // ── Courses ───────────────────────────────────────────────────────────────────
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

  // ── Course Metadata ───────────────────────────────────────────────────────────
  const courseTags = [
    ["Lab-based", "STEM-intensive"],
    ["Writing Intensive", "Discussion-based"],
    ["Project-based", "Team collaboration"],
    ["Lecture-heavy", "Reading-intensive"],
    ["Flipped classroom", "Practical application"],
    ["Research-oriented", "Independent study"]
  ];
  const courseMetadataData = courseRecords.slice(0, 80).map((course, i) => ({
    courseId: course.id,
    professorId: course.professorId ?? null,
    tags: courseTags[i % courseTags.length],
    gradeDistribution: {
      A: randInt(15, 45),
      B: randInt(20, 40),
      C: randInt(10, 25),
      D: randInt(2, 10),
      F: randInt(1, 5)
    },
    classSize: randInt(18, 120)
  }));
  await prisma.courseMetadata.createMany({ data: courseMetadataData });

  // ── Materials ─────────────────────────────────────────────────────────────────
  const materialTemplates = [
    { title: "Exam prep guide", content: "Key topics, practice prompts, and a checklist for midterm readiness. Includes sample questions and pacing tips." },
    { title: "Lecture notes pack", content: "Concise lecture notes with summaries, definitions, and quick examples pulled from weekly topics." },
    { title: "Project rubric + tips", content: "Rubric highlights, common pitfalls, and a breakdown of how to structure your final project." }
  ];
  const materialsData = [];
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
      content: "Additional practice items, sample outlines, and a short study plan for the final stretch.",
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

  // ── Schedule entries ──────────────────────────────────────────────────────────
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

  // ── Saved courses ─────────────────────────────────────────────────────────────
  const savedCourseData = [];
  studentRecords.slice(0, 10).forEach((student, index) => {
    const course = courseRecords[(index + 5) % courseRecords.length];
    savedCourseData.push({ userId: student.id, courseId: course.id });
  });
  if (savedCourseData.length > 0) {
    await prisma.savedCourse.createMany({ data: savedCourseData, skipDuplicates: true });
  }

  // ── Notifications ─────────────────────────────────────────────────────────────
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

  // ── Reviews: 4 years of historical data ──────────────────────────────────────
  // Date range: Jan 2022 – Feb 2026 (present)
  const histStart = new Date("2022-01-01");
  const histEnd = new Date("2026-02-09");
  const gradeOptions = ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"];

  const reviewsData = [];
  const reviewResponsesData = [];

  // Give all 120 professors a good number of reviews for professors 0–19 (10+ each)
  // and smaller counts for the rest

  // Block A: First 20 professors get 12–18 reviews each (to qualify for AI summary)
  for (let pi = 0; pi < 20; pi += 1) {
    const professor = professorRecords[pi];
    const reviewsForThisProfessor = randInt(12, 18);
    for (let ri = 0; ri < reviewsForThisProfessor; ri += 1) {
      // Alternate between edu and com students
      const useEdu = ri % 2 === 0;
      const studentPool = useEdu ? eduStudents : comStudents;
      const student = studentPool[ri % studentPool.length];
      const rating = randInt(1, 5);
      // Weight review bodies: positive for high ratings, negative for low
      let bodyPool;
      if (rating >= 4) bodyPool = positiveReviewBodies;
      else if (rating === 3) bodyPool = mixedReviewBodies;
      else bodyPool = negativeReviewBodies;

      const createdAt = randDate(histStart, histEnd);
      reviewsData.push({
        rating,
        difficulty: Math.min(5, Math.max(1, 6 - rating + randInt(-1, 1))),
        expertise: Math.min(5, Math.max(1, rating + randInt(-1, 1))),
        enjoyability: Math.min(5, Math.max(1, rating + randInt(-1, 0))),
        clarity: Math.min(5, Math.max(1, rating + randInt(-1, 1))),
        body: bodyPool[ri % bodyPool.length],
        helpfulUp: randInt(0, 20),
        helpfulDown: randInt(0, 5),
        wouldTakeAgain: Math.random() > 0.35,
        forCredit: Math.random() > 0.2,
        attendanceMandatory: Math.random() > 0.5,
        textbookRequired: Math.random() > 0.55,
        onlineClass: Math.random() > 0.7,
        grade: gradeOptions[randInt(0, gradeOptions.length - 1)],
        studentId: student.id,
        professorId: professor.id,
        createdAt,
        updatedAt: createdAt
      });
    }
  }

  // Block B: Professors 20–59 get 4–10 reviews each
  for (let pi = 20; pi < 60; pi += 1) {
    const professor = professorRecords[pi];
    const reviewsForThisProfessor = randInt(4, 10);
    for (let ri = 0; ri < reviewsForThisProfessor; ri += 1) {
      const useEdu = Math.random() > 0.45; // ~55% edu
      const studentPool = useEdu ? eduStudents : comStudents;
      const student = studentPool[ri % studentPool.length];
      const rating = randInt(1, 5);
      const body = allReviewBodies[randInt(0, allReviewBodies.length - 1)];
      const createdAt = randDate(histStart, histEnd);
      reviewsData.push({
        rating,
        difficulty: Math.min(5, Math.max(1, 6 - rating + randInt(-1, 1))),
        expertise: Math.min(5, Math.max(1, rating + randInt(-1, 1))),
        enjoyability: Math.min(5, Math.max(1, rating + randInt(-1, 0))),
        clarity: Math.min(5, Math.max(1, rating + randInt(-1, 1))),
        body,
        helpfulUp: randInt(0, 15),
        helpfulDown: randInt(0, 4),
        wouldTakeAgain: Math.random() > 0.4,
        forCredit: Math.random() > 0.2,
        attendanceMandatory: Math.random() > 0.5,
        textbookRequired: Math.random() > 0.55,
        onlineClass: Math.random() > 0.7,
        grade: gradeOptions[randInt(0, gradeOptions.length - 1)],
        studentId: student.id,
        professorId: professor.id,
        createdAt,
        updatedAt: createdAt
      });
    }
  }

  // Block C: Professors 60–119 get 1–4 reviews each
  for (let pi = 60; pi < professorCount; pi += 1) {
    const professor = professorRecords[pi];
    const reviewsForThisProfessor = randInt(1, 4);
    for (let ri = 0; ri < reviewsForThisProfessor; ri += 1) {
      const useEdu = Math.random() > 0.5;
      const studentPool = useEdu ? eduStudents : comStudents;
      const student = studentPool[ri % studentPool.length];
      const rating = randInt(1, 5);
      const body = allReviewBodies[randInt(0, allReviewBodies.length - 1)];
      const createdAt = randDate(histStart, histEnd);
      reviewsData.push({
        rating,
        difficulty: Math.min(5, Math.max(1, 6 - rating + randInt(-1, 1))),
        expertise: Math.min(5, Math.max(1, rating + randInt(-1, 1))),
        enjoyability: Math.min(5, Math.max(1, rating + randInt(-1, 0))),
        clarity: Math.min(5, Math.max(1, rating + randInt(-1, 1))),
        body,
        helpfulUp: randInt(0, 8),
        helpfulDown: randInt(0, 3),
        wouldTakeAgain: Math.random() > 0.4,
        forCredit: Math.random() > 0.3,
        attendanceMandatory: Math.random() > 0.5,
        textbookRequired: Math.random() > 0.55,
        onlineClass: Math.random() > 0.7,
        grade: gradeOptions[randInt(0, gradeOptions.length - 1)],
        studentId: student.id,
        professorId: professor.id,
        createdAt,
        updatedAt: createdAt
      });
    }
  }

  console.log(`Creating ${reviewsData.length} reviews...`);
  const createdReviews = [];
  for (const reviewData of reviewsData) {
    const created = await prisma.review.create({ data: reviewData });
    createdReviews.push(created);
  }

  // Professor responses for a subset of reviews — these start as APPROVED in seed
  createdReviews.slice(0, 30).forEach((review) => {
    const professor = professorRecords.find((p) => p.id === review.professorId);
    if (!professor) return;
    reviewResponsesData.push({
      body: "Thank you for the thoughtful feedback. I've updated the course materials based on this.",
      reviewId: review.id,
      professorId: professor.id,
      status: "APPROVED"
    });
  });

  // A few PENDING responses that need moderation
  createdReviews.slice(30, 35).forEach((review) => {
    const professor = professorRecords.find((p) => p.id === review.professorId);
    if (!professor) return;
    reviewResponsesData.push({
      body: "I appreciate you taking the time to share your experience with the class.",
      reviewId: review.id,
      professorId: professor.id,
      status: "PENDING"
    });
  });

  if (reviewResponsesData.length > 0) {
    await prisma.reviewResponse.createMany({ data: reviewResponsesData });
  }

  // Review views
  const reviewViews = [];
  createdReviews.slice(0, 30).forEach((review, index) => {
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

  // ── School reviews ────────────────────────────────────────────────────────────
  const schoolReviewsData = [];
  const ratingValue = () => randInt(1, 10);
  for (const student of studentRecords) {
    const school = schoolRecords[Math.floor(Math.random() * schoolRecords.length)];
    schoolReviewsData.push({
      overall: ratingValue(), reputation: ratingValue(), opportunities: ratingValue(),
      clubs: ratingValue(), safety: ratingValue(), location: ratingValue(),
      facilities: ratingValue(), happiness: ratingValue(), internet: ratingValue(),
      food: ratingValue(), social: ratingValue(),
      body: "Great campus community with supportive resources and engaging events.",
      helpfulUp: randInt(0, 10),
      helpfulDown: randInt(0, 3),
      studentId: student.id,
      schoolId: school.id
    });
  }
  if (schoolReviewsData.length > 0) {
    await prisma.schoolReview.createMany({ data: schoolReviewsData });
  }

  // ── VerificationStatus for all .edu students ──────────────────────────────────
  // FERPA: We store only a hashed token. The raw token is never persisted.
  const verificationData = [];
  for (const student of eduStudents) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const verifiedAt = new Date(Date.now() - randInt(30, 365) * 24 * 60 * 60 * 1000);
    verificationData.push({
      userId: student.id,
      eduEmail: student.email,
      tokenHash,
      status: "VERIFIED",
      verifiedAt,
      expiresAt: new Date(verifiedAt.getTime() + 365 * 24 * 60 * 60 * 1000)
    });
  }
  // A few .edu students with PENDING status (recently requested, not yet confirmed)
  const pendingEduCount = Math.min(5, comStudents.length);
  for (let i = 0; i < pendingEduCount; i += 1) {
    const student = comStudents[i];
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const eduEmail = `${student.email.split("@")[0]}@${eduDomains[i % eduDomains.length]}`;
    verificationData.push({
      userId: student.id,
      eduEmail,
      tokenHash,
      status: "PENDING",
      verifiedAt: null,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
  }
  await prisma.verificationStatus.createMany({ data: verificationData });

  // ── Professor Profiles (portal) ───────────────────────────────────────────────
  // First 15 professors have claimed profiles with bios and syllabi
  const professorProfileData = [];
  const bios = [
    "Associate Professor of Computer Science with a focus on distributed systems and cloud infrastructure. 15 years of industry experience before transitioning to academia.",
    "I teach undergraduate and graduate courses in mathematical analysis. My research explores numerical methods for partial differential equations.",
    "Historian specializing in 20th century social movements. Published in multiple peer-reviewed journals and a recipient of the NEH fellowship.",
    "Biologist and educator passionate about ecology and conservation. I bring field research into the classroom whenever possible.",
    "Economist with expertise in behavioral economics and public policy. Former advisor to state legislature on fiscal reform.",
    "I've been teaching psychology for over a decade with a focus on cognitive neuroscience. Office hours are always open.",
    "Computer scientist and former Silicon Valley engineer. I believe in learning by doing — every course includes a real-world project.",
    "Mathematician turned educator. I teach proof-based courses and enjoy helping students develop rigorous thinking.",
    "My research is in molecular biology and genetics. I run an active research lab and welcome students to join.",
    "Economics professor focused on international trade and development economics. Worked with World Bank prior to academia.",
    "I teach introductory and advanced courses in psychology. My lab studies memory consolidation and sleep.",
    "Data scientist and statistician. All of my courses emphasize practical skills alongside theoretical foundations.",
    "Environmental biologist and field researcher. My courses integrate lab and outdoor field work throughout the semester.",
    "Professor of history and director of the regional archives. Teaching is about making the past relevant to the present.",
    "Applied mathematician with a passion for teaching. Office hours are the best part of my week."
  ];
  for (let i = 0; i < 15; i += 1) {
    professorProfileData.push({
      professorId: professorRecords[i].id,
      isClaimed: true,
      claimMethod: i % 3 === 0 ? "SSO" : "EMAIL",
      claimedAt: new Date(Date.now() - randInt(30, 180) * 24 * 60 * 60 * 1000),
      bio: bios[i % bios.length],
      officialEmail: `faculty.${i + 1}@university.edu`,
      syllabusUrl: i < 8 ? `https://utfs.io/f/syllabus-placeholder-${i + 1}.pdf` : null,
      syllabusFilename: i < 8 ? `syllabus_spring_2026.pdf` : null,
      syllabusUploadedAt: i < 8
        ? new Date(Date.now() - randInt(7, 60) * 24 * 60 * 60 * 1000)
        : null
    });
  }
  // 5 more with unclaimed profiles (stub rows)
  for (let i = 15; i < 20; i += 1) {
    professorProfileData.push({
      professorId: professorRecords[i].id,
      isClaimed: false
    });
  }
  await prisma.professorProfile.createMany({ data: professorProfileData });

  // ── ReviewSummaries: pre-generated summaries for first 20 professors ──────────
  // These represent what the nightly CRON would generate via OpenAI.
  const summaryTemplates = [
    {
      quickTake: "A rigorous and well-organized instructor who challenges students but provides the scaffolding to succeed. Reviews consistently highlight clear lectures and timely feedback. Best suited for motivated students who attend every class.",
      workload: "Expect 6–8 hours of outside work per week. Assignments are frequent but purposeful.",
      gradingDifficulty: "Grades fairly but curves sparingly. Rubrics are detailed — follow them.",
      teachingStyle: "Lecture-driven with integrated Q&A. Slides are posted before class.",
      sentimentScore: 0.82
    },
    {
      quickTake: "Students consistently describe this professor as approachable and knowledgeable. The workload is manageable and the grading is transparent. A strong choice for anyone new to the subject.",
      workload: "Light to moderate — roughly 4–6 hours weekly outside class.",
      gradingDifficulty: "Known for being fair. Partial credit is common on exams.",
      teachingStyle: "Conversational and interactive. Encourages questions during and after class.",
      sentimentScore: 0.88
    },
    {
      quickTake: "This professor divides opinion. Those who keep up with readings find the course deeply rewarding; those who fall behind struggle. The teaching is inspired but demanding.",
      workload: "Heavy. Reading-intensive with weekly response papers.",
      gradingDifficulty: "Exams require synthesis and critical thinking, not just recall. Study groups help.",
      teachingStyle: "Socratic method — expect to be called on. Comes prepared and expects students to as well.",
      sentimentScore: 0.62
    },
    {
      quickTake: "A practical, industry-connected instructor who brings real-world case studies into every lecture. Students appreciate the relevance of the material, though some wish for more structured feedback.",
      workload: "Project-heavy with one major deliverable each month.",
      gradingDifficulty: "Grading leans toward process and effort rather than output perfection.",
      teachingStyle: "Case-based and collaborative. Group work is a core component.",
      sentimentScore: 0.76
    },
    {
      quickTake: "Strong command of subject matter but delivery can be dense for first-timers. Consistent office hours attendance makes a big difference. Rewarding if you invest the effort.",
      workload: "Substantial. Plan for 8+ hours per week during exam prep windows.",
      gradingDifficulty: "Strict but consistent. Every point is documented and explained.",
      teachingStyle: "Traditional lecture format. Slides are thorough and supplement well.",
      sentimentScore: 0.69
    }
  ];

  const reviewSummaryData = [];
  for (let i = 0; i < 20; i += 1) {
    const template = summaryTemplates[i % summaryTemplates.length];
    const professorReviews = createdReviews.filter(
      (r) => r.professorId === professorRecords[i].id
    );
    reviewSummaryData.push({
      professorId: professorRecords[i].id,
      quickTake: template.quickTake,
      workload: template.workload,
      gradingDifficulty: template.gradingDifficulty,
      teachingStyle: template.teachingStyle,
      sentimentScore: template.sentimentScore + (Math.random() * 0.1 - 0.05),
      reviewCount: professorReviews.length,
      modelUsed: "gpt-4o-mini",
      lastUpdated: new Date()
    });
  }
  await prisma.reviewSummary.createMany({ data: reviewSummaryData });

  // ── NextAuth seed data ────────────────────────────────────────────────────────
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

  console.log(`✅ Seed complete.`);
  console.log(`   ${professorRecords.length} professors`);
  console.log(`   ${studentRecords.length} students (${eduStudents.length} .edu / ${comStudents.length} .com)`);
  console.log(`   ${createdReviews.length} reviews (4-year historical spread)`);
  console.log(`   ${verificationData.length} verification records`);
  console.log(`   ${professorProfileData.length} professor profiles`);
  console.log(`   ${reviewSummaryData.length} AI review summaries (pre-seeded)`);
  console.log(`   ${courseMetadataData.length} course metadata records`);
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
