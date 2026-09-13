import { useEffect, useRef, useState } from "react";

export default function Home({ onOpenLogin, onOpenRegister }) {
  const typedRef = useRef(null);
  const typedInstance = useRef(null);

  // Filter state for courses catalog
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Interactive Progress Tracker Demo State
  const [userXp, setUserXp] = useState(2450);
  const [completedQuests, setCompletedQuests] = useState([]);
  const [streakDays, setStreakDays] = useState({
    Mon: true,
    Tue: true,
    Wed: true,
    Thu: true,
    Fri: true,
    Sat: false,
    Sun: false,
  });

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [enrollEmail, setEnrollEmail] = useState("");

  useEffect(function () {
    if (typedRef.current && window.Typed) {
      typedInstance.current = new window.Typed(typedRef.current, {
        strings: [
          "Interactive Learning Made Joyful",
          "Smart Student & School Management",
          "Track Daily Streaks & Milestones",
          "Real-Time Attendance & Reports",
          "Where Curiosity Becomes Genius",
          "Empowering Future Explorers",
        ],
        typeSpeed: 45,
        backSpeed: 28,
        backDelay: 2200,
        loop: true,
        showCursor: true,
        cursorChar: " ✦",
      });
    }
    return function () {
      if (typedInstance.current) {
        typedInstance.current.destroy();
      }
    };
  }, []);

  // Handle XP Quest Click
  function handleCompleteQuest(questId, xpReward) {
    if (completedQuests.includes(questId)) return;
    setCompletedQuests([...completedQuests, questId]);
    setUserXp((prev) => prev + xpReward);
  }

  // Toggle Day Streak
  function toggleDayStreak(day) {
    setStreakDays((prev) => ({ ...prev, [day]: !prev[day] }));
  }

  // Course Data
  const courses = [
    {
      id: "stem-1",
      title: "Robotics Lab & AI Explorer",
      category: "stem",
      icon: "🤖",
      themeClass: "clay-card-coral",
      colorTag: "#ff7056",
      difficulty: "Intermediate",
      rating: "4.95",
      reviews: "1,240",
      lessons: "24 Lessons",
      duration: "6.5 hrs",
      description: "Build interactive simulations, learn sensors logic, and program smart bot behaviors with visual blocks.",
      instructor: "Dr. Aris Vance",
      instructorRole: "Robotics Lead",
      avatarBg: "linear-gradient(135deg, #ff7056, #f72585)",
    },
    {
      id: "math-1",
      title: "Mental Math & Speed Olympiad",
      category: "math",
      icon: "🧮",
      themeClass: "clay-card-teal",
      colorTag: "#06d6a0",
      difficulty: "All Levels",
      rating: "4.98",
      reviews: "2,180",
      lessons: "18 Lessons",
      duration: "4.2 hrs",
      description: "Master quick calculation shortcuts, mental geometry, and puzzle cracking with gamified daily math quests.",
      instructor: "Elena Rostova",
      instructorRole: "Math Olympiad Coach",
      avatarBg: "linear-gradient(135deg, #06d6a0, #00b4d8)",
    },
    {
      id: "coding-1",
      title: "Creative Python: Games & Apps",
      category: "coding",
      icon: "💻",
      themeClass: "clay-card-purple",
      colorTag: "#9d4edd",
      difficulty: "Beginner",
      rating: "4.92",
      reviews: "950",
      lessons: "30 Lessons",
      duration: "8.0 hrs",
      description: "From print('Hello') to building your very first playable arcade games with physics and sound effects.",
      instructor: "Marcus Brody",
      instructorRole: "Senior Game Dev",
      avatarBg: "linear-gradient(135deg, #9d4edd, #6366f1)",
    },
    {
      id: "art-1",
      title: "3D Clay Art & Digital Wonder",
      category: "art",
      icon: "🎨",
      themeClass: "clay-card-amber",
      colorTag: "#ffb703",
      difficulty: "Beginner",
      rating: "4.96",
      reviews: "810",
      lessons: "16 Lessons",
      duration: "5.0 hrs",
      description: "Craft tactile 3D characters, colorful isometric environments, and bring imaginary creatures to life.",
      instructor: "Chloe Moreau",
      instructorRole: "Concept Artist",
      avatarBg: "linear-gradient(135deg, #ffb703, #fb8500)",
    },
    {
      id: "stem-2",
      title: "Cosmic Odyssey: Astrophysics Kids",
      category: "stem",
      icon: "🚀",
      themeClass: "clay-card-teal",
      colorTag: "#06d6a0",
      difficulty: "Intermediate",
      rating: "4.90",
      reviews: "670",
      lessons: "14 Lessons",
      duration: "3.8 hrs",
      description: "Journey through black holes, exoplanets, and telescope optics with 3D interactive planetarium models.",
      instructor: "Prof. Neil Howard",
      instructorRole: "Astronomer",
      avatarBg: "linear-gradient(135deg, #3a86ff, #06d6a0)",
    },
    {
      id: "lang-1",
      title: "Storycraft: Creative World Lore",
      category: "lang",
      icon: "📜",
      themeClass: "clay-card-coral",
      colorTag: "#ff7056",
      difficulty: "All Levels",
      rating: "4.94",
      reviews: "1,100",
      lessons: "20 Lessons",
      duration: "5.5 hrs",
      description: "Write compelling character arcs, invent mythical cultures, and publish illustrated digital micro-novels.",
      instructor: "Amina Al-Mansoor",
      instructorRole: "Author & Educator",
      avatarBg: "linear-gradient(135deg, #f72585, #7209b7)",
    },
  ];

  const filteredCourses = selectedCategory === "all"
    ? courses
    : courses.filter((c) => c.category === selectedCategory);

  // Smooth scroll helper
  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }

  // Calculate user level & XP percent
  const currentLevel = Math.floor(userXp / 400) + 1;
  const xpInCurrentLevel = userXp % 400;
  const xpPercent = Math.min(Math.round((xpInCurrentLevel / 400) * 100), 100);

  return (
    <div className="hero-wrapper">
      {/* Background Student Backdrop with Cozy Overlay */}
      <div className="hero-student-backdrop" />

      {/* ============================================================
          HERO SECTION
          ============================================================ */}
      <section className="hero-page">
        {/* Animated background floating glow shapes */}
        <div className="hero-shapes">
          <div className="hero-shape hero-shape-1" />
          <div className="hero-shape hero-shape-2" />
          <div className="hero-shape hero-shape-3" />
        </div>

        <div className="hero-content">
          {/* LEFT — Animated school illustration with Clay frame */}
          <div className="hero-illustration">
            <div className="hero-school-scene clay-card" style={{ padding: "20px 24px 36px", border: "1px solid rgba(255,255,255,0.18)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span className="clay-badge" style={{ background: "rgba(6, 214, 160, 0.15)", color: "#06d6a0" }}>
                  🟢 Live Campus
                </span>
                <span className="clay-badge" style={{ background: "rgba(255, 183, 3, 0.15)", color: "#ffb703" }}>
                  ⭐ 4.97 Rating
                </span>
              </div>

              <SchoolSVG />

              {/* Floating Emojis */}
              <span className="hero-floating-icon" style={{ top: "14%", left: "10%" }}>📚</span>
              <span className="hero-floating-icon" style={{ top: "18%", right: "8%" }}>🎓</span>
              <span className="hero-floating-icon" style={{ top: "42%", left: "-4%" }}>✏️</span>
              <span className="hero-floating-icon" style={{ bottom: "24%", right: "-2%" }}>🏆</span>
              <span className="hero-floating-icon" style={{ bottom: "12%", left: "10%" }}>📝</span>
              <span className="hero-floating-icon" style={{ top: "60%", right: "-8%" }}>⭐</span>

              {/* Hero floating student pill preview */}
              <div className="hero-students-float-card">
                <div className="hero-students-avatar-group">
                  <div className="hero-students-avatar-mini" style={{ background: "#ff7056" }}>🧒🏽</div>
                  <div className="hero-students-avatar-mini" style={{ background: "#06d6a0" }}>👧🏻</div>
                  <div className="hero-students-avatar-mini" style={{ background: "#9d4edd" }}>👦🏼</div>
                  <div className="hero-students-avatar-mini" style={{ background: "#ffb703" }}>👩🏾</div>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>12,800+ Students</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Active learning today</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — Text + Typed.js */}
          <div className="hero-text">
            <div className="hero-tag clay-badge" style={{ background: "rgba(99, 102, 241, 0.18)", color: "#c7d2fe" }}>
              <span className="hero-tag-dot" />
              Next-Gen Playful Learning Platform
            </div>

            <h1 className="hero-title">
              Spark Curiosity With <br />
              <span className="hero-title-gradient">EduVerse</span>
            </h1>

            <div className="hero-typed-wrapper">
              <span ref={typedRef} />
            </div>

            <p className="hero-description">
              The delightfully comfortable school platform that brings lessons to life. 
              Track student attendance, manage subscriptions, unlock learning quests, 
              and celebrate academic streaks — all inside a warm, tactile digital campus.
            </p>

            <div className="hero-actions">
              <button
                className="clay-btn clay-btn-coral"
                onClick={onOpenRegister}
                id="hero-enroll-btn"
              >
                Join Free Today
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
              <button
                className="clay-btn"
                style={{ background: "rgba(255, 255, 255, 0.08)", color: "#fff" }}
                onClick={() => scrollToSection("catalog")}
                id="hero-explore-btn"
              >
                Explore Courses
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                </svg>
              </button>
            </div>

            <div className="hero-stats">
              <div>
                <div className="hero-stat-number" style={{ color: "#ff7056" }}>15K+</div>
                <div className="hero-stat-label">Enrolled Learners</div>
              </div>
              <div>
                <div className="hero-stat-number" style={{ color: "#06d6a0" }}>99.8%</div>
                <div className="hero-stat-label">Attendance Rate</div>
              </div>
              <div>
                <div className="hero-stat-number" style={{ color: "#ffb703" }}>450+</div>
                <div className="hero-stat-label">Certified Quests</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 1: COURSE CATALOG PREVIEW (CLAYMORPHISM CARDS)
          ============================================================ */}
      <section className="landing-section" id="catalog">
        <div className="section-header">
          <div className="section-tag">Explore The Curriculum</div>
          <h2 className="section-title">
            Playful Courses Built For <span>Bright Minds</span>
          </h2>
          <p className="section-subtitle">
            From hands-on robotics to computational thinking and creative storytelling.
            Each course is designed with bite-sized lessons and tactile milestones.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="catalog-filter-bar">
          <button
            className={`catalog-filter-btn ${selectedCategory === "all" ? "active" : ""}`}
            onClick={() => setSelectedCategory("all")}
          >
            🌟 All Subjects
          </button>
          <button
            className={`catalog-filter-btn ${selectedCategory === "stem" ? "active" : ""}`}
            onClick={() => setSelectedCategory("stem")}
          >
            🤖 STEM & Science
          </button>
          <button
            className={`catalog-filter-btn ${selectedCategory === "math" ? "active" : ""}`}
            onClick={() => setSelectedCategory("math")}
          >
            🧮 Math & Logic
          </button>
          <button
            className={`catalog-filter-btn ${selectedCategory === "coding" ? "active" : ""}`}
            onClick={() => setSelectedCategory("coding")}
          >
            💻 Coding & Tech
          </button>
          <button
            className={`catalog-filter-btn ${selectedCategory === "art" ? "active" : ""}`}
            onClick={() => setSelectedCategory("art")}
          >
            🎨 Art & Design
          </button>
          <button
            className={`catalog-filter-btn ${selectedCategory === "lang" ? "active" : ""}`}
            onClick={() => setSelectedCategory("lang")}
          >
            📜 Language & Lore
          </button>
        </div>

        {/* Course Cards Grid */}
        <div className="courses-grid">
          {filteredCourses.map((course) => (
            <div key={course.id} className={`clay-card course-clay-card ${course.themeClass}`}>
              <div>
                <div className="course-card-top">
                  <div
                    className="course-icon-bubble"
                    style={{ background: `linear-gradient(135deg, ${course.colorTag}33, ${course.colorTag}66)` }}
                  >
                    {course.icon}
                  </div>
                  <span
                    className="course-difficulty-tag clay-badge"
                    style={{ background: `${course.colorTag}22`, color: course.colorTag }}
                  >
                    {course.difficulty}
                  </span>
                </div>

                <h3 className="course-title">{course.title}</h3>
                <p className="course-description">{course.description}</p>
              </div>

              <div>
                <div className="course-meta-row">
                  <div className="course-meta-item">
                    <span>⭐</span>
                    <strong style={{ color: "#fff" }}>{course.rating}</strong>
                    <span>({course.reviews})</span>
                  </div>
                  <div className="course-meta-item">
                    <span>⏱️</span>
                    <span>{course.duration}</span>
                  </div>
                  <div className="course-meta-item">
                    <span>📖</span>
                    <span>{course.lessons}</span>
                  </div>
                </div>

                <div className="course-card-footer">
                  <div className="course-instructor">
                    <div className="instructor-avatar" style={{ background: course.avatarBg }}>
                      {course.instructor.charAt(0)}
                    </div>
                    <div>
                      <div className="instructor-name">{course.instructor}</div>
                      <div className="instructor-role">{course.instructorRole}</div>
                    </div>
                  </div>

                  <button
                    className="clay-btn clay-btn-coral"
                    style={{ padding: "8px 18px", fontSize: 13 }}
                    onClick={onOpenRegister}
                  >
                    Enroll Free
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================
          SECTION 2: PROGRESS TRACKING DEMO (STUDY QUEST)
          ============================================================ */}
      <section className="landing-section" id="progress-demo">
        <div className="section-header">
          <div className="section-tag">Interactive Preview</div>
          <h2 className="section-title">
            Gamified Progress Tracking <span>That Motivates</span>
          </h2>
          <p className="section-subtitle">
            Experience what students feel every day! Complete sample quests below,
            boost your XP bar, and see streaks keep learners engaged and accountable.
          </p>
        </div>

        <div className="progress-demo-container">
          {/* LEFT: Live Interactive Student Quest Board */}
          <div className="clay-card progress-interactive-board clay-card-purple">
            <div className="tracker-header-row">
              <div className="student-badge-level">
                <div className="level-ring">
                  <span>LVL</span>
                  {currentLevel}
                </div>
                <div className="level-info">
                  <h3>Alex Rivera</h3>
                  <p>Grade 8 • Science & Coding Track</p>
                </div>
              </div>

              <div className="streak-counter-pill">
                <span>🔥</span>
                <span>{Object.values(streakDays).filter(Boolean).length}-Day Streak</span>
              </div>
            </div>

            {/* Live XP Progress Bar */}
            <div className="xp-section">
              <div className="xp-header">
                <span>Experience Points (XP)</span>
                <span style={{ color: "#06d6a0", fontWeight: 700 }}>
                  {userXp} XP <span style={{ color: "var(--text-muted)" }}>/ Next Lvl in {400 - xpInCurrentLevel} XP</span>
                </span>
              </div>
              <div className="xp-track">
                <div className="xp-fill" style={{ width: `${xpPercent}%` }} />
              </div>
            </div>

            {/* Weekly Streak Interactive Toggle */}
            <div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>
                Weekly Attendance & Study Log (Click to Toggle Days):
              </span>
              <span style={{ fontSize: 11, color: "#06d6a0" }}>95% Consistency</span>
            </div>
            <div className="week-streak-grid">
              {Object.keys(streakDays).map((day) => {
                const isCompleted = streakDays[day];
                return (
                  <div key={day} className="day-pill" onClick={() => toggleDayStreak(day)} title={`Toggle ${day}`}>
                    <div className={`day-dot ${isCompleted ? "completed" : ""}`}>
                      {isCompleted ? "✓" : "○"}
                    </div>
                    <span className="day-name">{day}</span>
                  </div>
                );
              })}
            </div>

            {/* Interactive Quests */}
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
                🎯 Daily Interactive Challenges (Click to Earn XP):
              </span>
            </div>
            <div className="quests-list">
              <div className="quest-item">
                <div className="quest-left">
                  <span className="quest-icon">⚡</span>
                  <div>
                    <div className="quest-title">Solve 3 Math Olympiad Puzzles</div>
                    <div className="quest-meta">Topic: Speed Multiplication</div>
                  </div>
                </div>
                <button
                  className={`quest-xp-btn ${completedQuests.includes("q1") ? "done" : ""}`}
                  onClick={() => handleCompleteQuest("q1", 120)}
                >
                  {completedQuests.includes("q1") ? "Completed ✓" : "+120 XP"}
                </button>
              </div>

              <div className="quest-item">
                <div className="quest-left">
                  <span className="quest-icon">🤖</span>
                  <div>
                    <div className="quest-title">Debug Python Robot Sensor Loop</div>
                    <div className="quest-meta">Topic: Conditional Logic</div>
                  </div>
                </div>
                <button
                  className={`quest-xp-btn ${completedQuests.includes("q2") ? "done" : ""}`}
                  onClick={() => handleCompleteQuest("q2", 150)}
                >
                  {completedQuests.includes("q2") ? "Completed ✓" : "+150 XP"}
                </button>
              </div>

              <div className="quest-item">
                <div className="quest-left">
                  <span className="quest-icon">📖</span>
                  <div>
                    <div className="quest-title">Read Weekly School Campus Bulletin</div>
                    <div className="quest-meta">Notice Board Module</div>
                  </div>
                </div>
                <button
                  className={`quest-xp-btn ${completedQuests.includes("q3") ? "done" : ""}`}
                  onClick={() => handleCompleteQuest("q3", 80)}
                >
                  {completedQuests.includes("q3") ? "Completed ✓" : "+80 XP"}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Badges & Parent Insights */}
          <div className="progress-demo-side">
            <div className="clay-card badges-showcase-card clay-card-amber">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: 18, color: "#fff", margin: 0 }}>Unlocked Milestones</h3>
                <span className="clay-badge" style={{ background: "rgba(255, 183, 3, 0.2)", color: "#ffb703" }}>
                  4 / 8 Earned
                </span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 6, marginBottom: 0 }}>
                Achievements earned through continuous effort and curiosity.
              </p>

              <div className="badges-grid">
                <div className="badge-item">
                  <div className="badge-icon-3d">🏆</div>
                  <div className="badge-title">Speed Demon</div>
                  <div className="badge-desc">7-Day Study Streak</div>
                </div>
                <div className="badge-item">
                  <div className="badge-icon-3d">🧠</div>
                  <div className="badge-title">Math Wizard</div>
                  <div className="badge-desc">100% Quiz Accuracy</div>
                </div>
                <div className="badge-item">
                  <div className="badge-icon-3d">🌟</div>
                  <div className="badge-title">Honor Roll</div>
                  <div className="badge-desc">Zero Missed Classes</div>
                </div>
                <div className="badge-item">
                  <div className="badge-icon-3d">🚀</div>
                  <div className="badge-title">Code Explorer</div>
                  <div className="badge-desc">Completed First App</div>
                </div>
              </div>
            </div>

            {/* Parent & Teacher Real-Time Sync Pill */}
            <div className="clay-card clay-card-teal" style={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 16,
                    background: "rgba(6, 214, 160, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                  }}
                >
                  📱
                </div>
                <div>
                  <h4 style={{ fontSize: 16, color: "#fff", margin: 0 }}>Instant Parent Notifications</h4>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
                    Attendance alerts and weekly progress summaries sent directly to guardians.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 3: STUDENT & PARENT TESTIMONIALS
          ============================================================ */}
      <section className="landing-section" id="testimonials">
        <div className="section-header">
          <div className="section-tag">Loved By Learners</div>
          <h2 className="section-title">
            Stories From Our <span>Campus Community</span>
          </h2>
          <p className="section-subtitle">
            See how EduVerse transforms everyday school life for students,
            educators, and engaged parents.
          </p>
        </div>

        <div className="testimonials-grid">
          {/* Testimonial 1 */}
          <div className="clay-card testimonial-clay-card clay-card-coral">
            <div>
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-quote">
                "EduVerse completely changed how I look at homework and math.
                Watching my streak build up and unlocking badges for Python
                challenges makes studying feel like my favorite strategy game!"
              </p>
            </div>
            <div className="testimonial-author">
              <div className="testimonial-avatar" style={{ background: "linear-gradient(135deg, #ff7056, #f72585)" }}>
                🧒🏽
              </div>
              <div>
                <div className="author-name">Maya Lin</div>
                <div className="author-role">Grade 8 Student • Robotics Track</div>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="clay-card testimonial-clay-card clay-card-teal">
            <div>
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-quote">
                "As a parent of two, keeping track of daily attendance, school fee
                subscriptions, and teacher announcements used to be chaotic. With
                EduVerse, everything is instantaneous and clean."
              </p>
            </div>
            <div className="testimonial-author">
              <div className="testimonial-avatar" style={{ background: "linear-gradient(135deg, #06d6a0, #00b4d8)" }}>
                👨🏻
              </div>
              <div>
                <div className="author-name">David Chen</div>
                <div className="author-role">Parent of 6th & 9th Graders</div>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="clay-card testimonial-clay-card clay-card-purple">
            <div>
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-quote">
                "The attendance recording and notice publishing features save me
                over 5 hours every single week. My students are always excited to
                check their daily dashboard."
              </p>
            </div>
            <div className="testimonial-author">
              <div className="testimonial-avatar" style={{ background: "linear-gradient(135deg, #9d4edd, #6366f1)" }}>
                👩🏼‍🏫
              </div>
              <div>
                <div className="author-name">Sarah Jenkins</div>
                <div className="author-role">High School STEM Teacher</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 4: ENROLLMENT CTA (SUPER-BANNER)
          ============================================================ */}
      <section className="landing-section" id="enroll-cta">
        <div className="enrollment-cta-box clay-card">
          <div className="cta-bg-image-overlay" />

          <div className="cta-content-inner">
            <div className="clay-badge" style={{ background: "rgba(6, 214, 160, 0.2)", color: "#06d6a0", marginBottom: 18 }}>
              ✨ Instant Access • No Credit Card Needed
            </div>

            <h2 className="cta-title">
              Ready To Make Learning <br />
              <span style={{ background: "linear-gradient(135deg, #ff7056, #ffb703)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Unstoppable & Fun?
              </span>
            </h2>

            <p className="cta-desc">
              Join thousands of educators, students, and parents building a smarter,
              happier learning journey today. Set up your classroom in under 2 minutes.
            </p>

            <div className="cta-perks-list">
              <div className="cta-perk-item">
                <span className="perk-check">✓</span>
                <span>Full Attendance & Notices Management</span>
              </div>
              <div className="cta-perk-item">
                <span className="perk-check">✓</span>
                <span>Gamified XP & Milestone Tracking</span>
              </div>
              <div className="cta-perk-item">
                <span className="perk-check">✓</span>
                <span>Student Subscriptions & Secure Payments</span>
              </div>
            </div>

            <div className="cta-form-row">
              <input
                type="email"
                placeholder="Enter your email to get started..."
                className="cta-input"
                value={enrollEmail}
                onChange={(e) => setEnrollEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onOpenRegister();
                }}
              />
              <button
                className="clay-btn clay-btn-teal"
                onClick={onOpenRegister}
                id="cta-enroll-submit-btn"
              >
                Claim Free Account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 5: FULL COMPREHENSIVE FOOTER
          ============================================================ */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-top-grid">
            {/* Brand column */}
            <div className="footer-brand-col">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 28 }}>🎓</span>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24, color: "#fff" }}>
                  EduVerse
                </span>
              </div>
              <p>
                The playful modern school management and interactive education
                platform. Designed for seamless administration, joyful student engagement,
                and total parental peace of mind.
              </p>
              <div style={{ marginTop: 20 }}>
                <span className="clay-badge" style={{ background: "rgba(6, 214, 160, 0.15)", color: "#06d6a0" }}>
                  🌱 100% Cloud-Powered & Secure
                </span>
              </div>
            </div>

            {/* Column 1: Platform */}
            <div className="footer-col">
              <h4>Platform</h4>
              <ul className="footer-links-list">
                <li><a href="#catalog">Course Catalog</a></li>
                <li><a href="#progress-demo">Study Quest</a></li>
                <li><a href="#testimonials">Testimonials</a></li>
                <li><a href="#enroll-cta">Enrollment</a></li>
                <li><a href="/login" onClick={(e) => { e.preventDefault(); onOpenLogin(); }}>Dashboard Login</a></li>
              </ul>
            </div>

            {/* Column 2: Modules */}
            <div className="footer-col">
              <h4>Modules</h4>
              <ul className="footer-links-list">
                <li><a href="/students" onClick={(e) => { e.preventDefault(); onOpenLogin(); }}>Student Records</a></li>
                <li><a href="/attendance" onClick={(e) => { e.preventDefault(); onOpenLogin(); }}>Attendance Sync</a></li>
                <li><a href="/notices" onClick={(e) => { e.preventDefault(); onOpenLogin(); }}>Notice Board</a></li>
                <li><a href="/subscriptions" onClick={(e) => { e.preventDefault(); onOpenLogin(); }}>Subscriptions</a></li>
                <li><a href="/dashboard" onClick={(e) => { e.preventDefault(); onOpenLogin(); }}>Role Access</a></li>
              </ul>
            </div>

            {/* Column 3: Resources */}
            <div className="footer-col">
              <h4>Resources</h4>
              <ul className="footer-links-list">
                <li><a href="#catalog">Learning Paths</a></li>
                <li><a href="#progress-demo">Milestone Badges</a></li>
                <li><a href="#testimonials">Case Studies</a></li>
                <li><a href="#faq">Parent FAQ</a></li>
                <li><a href="#support">Help Center</a></li>
              </ul>
            </div>

            {/* Column 4: Newsletter */}
            <div className="footer-col footer-newsletter-box">
              <h4>Stay Connected</h4>
              <p>Get weekly learning quests, educational tips, and release notes.</p>
              {newsletterSubscribed ? (
                <div style={{ color: "#06d6a0", fontSize: 13, fontWeight: 700, padding: "8px 0" }}>
                  🎉 Thank you for subscribing!
                </div>
              ) : (
                <form
                  className="footer-newsletter-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newsletterEmail) setNewsletterSubscribed(true);
                  }}
                >
                  <input
                    type="email"
                    placeholder="you@school.com"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                  />
                  <button type="submit" className="clay-btn clay-btn-coral" style={{ padding: "8px 16px", fontSize: 13 }}>
                    Join
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Footer Bottom Bar */}
          <div className="footer-bottom-bar">
            <div>
              © {new Date().getFullYear()} EduVerse Management Inc. All rights reserved. Made with 💜 for schools.
            </div>

            <div className="footer-social-row">
              <span className="footer-social-pill" title="Twitter / X">🐦</span>
              <span className="footer-social-pill" title="GitHub">🐙</span>
              <span className="footer-social-pill" title="Discord Community">💬</span>
              <span className="footer-social-pill" title="YouTube">📺</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* Inline SVG School Illustration with animated elements */
function SchoolSVG() {
  return (
    <svg className="hero-school-svg" viewBox="0 0 500 420" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ground */}
      <ellipse cx="250" cy="390" rx="220" ry="20" fill="url(#groundGrad)" opacity="0.5" />

      {/* Main building */}
      <rect x="100" y="160" width="300" height="220" rx="8" fill="url(#buildingGrad)" stroke="#6366f1" strokeWidth="1.5" opacity="0.9">
        <animate attributeName="opacity" values="0.85;0.95;0.85" dur="4s" repeatCount="indefinite" />
      </rect>

      {/* Building texture lines */}
      <line x1="100" y1="220" x2="400" y2="220" stroke="#6366f1" strokeWidth="0.5" opacity="0.3" />
      <line x1="100" y1="280" x2="400" y2="280" stroke="#6366f1" strokeWidth="0.5" opacity="0.3" />
      <line x1="100" y1="340" x2="400" y2="340" stroke="#6366f1" strokeWidth="0.5" opacity="0.3" />

      {/* Roof */}
      <polygon points="80,165 250,60 420,165" fill="url(#roofGrad)" stroke="#8b5cf6" strokeWidth="1.5" />
      <polygon points="90,165 250,68 410,165" fill="url(#roofGrad2)" opacity="0.5" />

      {/* Tower / Dome */}
      <rect x="215" y="90" width="70" height="75" fill="url(#towerGrad)" stroke="#6366f1" strokeWidth="1" rx="4" />
      <ellipse cx="250" cy="90" rx="38" ry="20" fill="url(#domeGrad)" stroke="#8b5cf6" strokeWidth="1" />

      {/* Clock */}
      <circle cx="250" cy="110" r="18" fill="#0a0e27" stroke="#22d3ee" strokeWidth="1.5">
        <animate attributeName="stroke-opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="250" cy="110" r="2" fill="#22d3ee" />
      <line x1="250" y1="110" x2="250" y2="97" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 250 110" to="360 250 110" dur="60s" repeatCount="indefinite" />
      </line>
      <line x1="250" y1="110" x2="260" y2="110" stroke="#22d3ee" strokeWidth="1" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 250 110" to="360 250 110" dur="3600s" repeatCount="indefinite" />
      </line>

      {/* Flag */}
      <line x1="250" y1="70" x2="250" y2="40" stroke="#8b5cf6" strokeWidth="2" />
      <polygon points="250,42 280,52 250,62" fill="url(#flagGrad)">
        <animate attributeName="points" values="250,42 280,52 250,62;250,42 278,50 250,60;250,42 280,52 250,62" dur="2s" repeatCount="indefinite" />
      </polygon>

      {/* Windows Row 1 */}
      <rect x="130" y="185" width="35" height="28" rx="4" fill="#0a0e27" stroke="#6366f1" strokeWidth="1" opacity="0.8" />
      <rect x="130" y="185" width="35" height="28" rx="4" fill="#22d3ee" opacity="0.15">
        <animate attributeName="opacity" values="0.1;0.25;0.1" dur="3s" begin="0s" repeatCount="indefinite" />
      </rect>

      <rect x="185" y="185" width="35" height="28" rx="4" fill="#0a0e27" stroke="#6366f1" strokeWidth="1" opacity="0.8" />
      <rect x="185" y="185" width="35" height="28" rx="4" fill="#6366f1" opacity="0.15">
        <animate attributeName="opacity" values="0.1;0.25;0.1" dur="3s" begin="0.5s" repeatCount="indefinite" />
      </rect>

      <rect x="280" y="185" width="35" height="28" rx="4" fill="#0a0e27" stroke="#6366f1" strokeWidth="1" opacity="0.8" />
      <rect x="280" y="185" width="35" height="28" rx="4" fill="#8b5cf6" opacity="0.15">
        <animate attributeName="opacity" values="0.1;0.25;0.1" dur="3s" begin="1s" repeatCount="indefinite" />
      </rect>

      <rect x="335" y="185" width="35" height="28" rx="4" fill="#0a0e27" stroke="#6366f1" strokeWidth="1" opacity="0.8" />
      <rect x="335" y="185" width="35" height="28" rx="4" fill="#22d3ee" opacity="0.15">
        <animate attributeName="opacity" values="0.1;0.25;0.1" dur="3s" begin="1.5s" repeatCount="indefinite" />
      </rect>

      {/* Windows Row 2 */}
      <rect x="130" y="245" width="35" height="28" rx="4" fill="#0a0e27" stroke="#6366f1" strokeWidth="1" opacity="0.8" />
      <rect x="130" y="245" width="35" height="28" rx="4" fill="#8b5cf6" opacity="0.15">
        <animate attributeName="opacity" values="0.1;0.25;0.1" dur="3s" begin="2s" repeatCount="indefinite" />
      </rect>

      <rect x="185" y="245" width="35" height="28" rx="4" fill="#0a0e27" stroke="#6366f1" strokeWidth="1" opacity="0.8" />
      <rect x="185" y="245" width="35" height="28" rx="4" fill="#22d3ee" opacity="0.15">
        <animate attributeName="opacity" values="0.1;0.25;0.1" dur="3s" begin="2.5s" repeatCount="indefinite" />
      </rect>

      <rect x="280" y="245" width="35" height="28" rx="4" fill="#0a0e27" stroke="#6366f1" strokeWidth="1" opacity="0.8" />
      <rect x="280" y="245" width="35" height="28" rx="4" fill="#6366f1" opacity="0.15">
        <animate attributeName="opacity" values="0.1;0.25;0.1" dur="3s" begin="0.8s" repeatCount="indefinite" />
      </rect>

      <rect x="335" y="245" width="35" height="28" rx="4" fill="#0a0e27" stroke="#6366f1" strokeWidth="1" opacity="0.8" />
      <rect x="335" y="245" width="35" height="28" rx="4" fill="#8b5cf6" opacity="0.15">
        <animate attributeName="opacity" values="0.1;0.25;0.1" dur="3s" begin="1.8s" repeatCount="indefinite" />
      </rect>

      {/* Door */}
      <rect x="225" y="310" width="50" height="70" rx="25" fill="#0a0e27" stroke="#8b5cf6" strokeWidth="1.5" />
      <rect x="225" y="310" width="50" height="70" rx="25" fill="url(#doorGrad)" opacity="0.3" />
      <circle cx="265" cy="350" r="3" fill="#fbbf24">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* Steps */}
      <rect x="210" y="375" width="80" height="8" rx="2" fill="#1a1d4a" stroke="#6366f1" strokeWidth="0.5" />
      <rect x="200" y="381" width="100" height="8" rx="2" fill="#1a1d4a" stroke="#6366f1" strokeWidth="0.5" />

      {/* Trees */}
      <circle cx="55" cy="310" r="32" fill="url(#treeGrad)" opacity="0.7">
        <animate attributeName="r" values="30;34;30" dur="5s" repeatCount="indefinite" />
      </circle>
      <rect x="52" y="335" width="6" height="45" rx="3" fill="#4a3728" />

      <circle cx="445" cy="320" r="28" fill="url(#treeGrad2)" opacity="0.7">
        <animate attributeName="r" values="26;30;26" dur="5s" begin="1s" repeatCount="indefinite" />
      </circle>
      <rect x="442" y="342" width="6" height="40" rx="3" fill="#4a3728" />

      {/* Clouds */}
      <g opacity="0.4">
        <ellipse cx="80" cy="50" rx="40" ry="15" fill="#6366f1">
          <animate attributeName="cx" values="80;100;80" dur="12s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="100" cy="45" rx="25" ry="12" fill="#6366f1">
          <animate attributeName="cx" values="100;120;100" dur="12s" repeatCount="indefinite" />
        </ellipse>
      </g>
      <g opacity="0.3">
        <ellipse cx="380" cy="35" rx="35" ry="12" fill="#8b5cf6">
          <animate attributeName="cx" values="380;360;380" dur="15s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="400" cy="30" rx="22" ry="10" fill="#8b5cf6">
          <animate attributeName="cx" values="400;380;400" dur="15s" repeatCount="indefinite" />
        </ellipse>
      </g>

      {/* Gradients */}
      <defs>
        <linearGradient id="groundGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
          <stop offset="50%" stopColor="#6366f1" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="buildingGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e2254" />
          <stop offset="100%" stopColor="#141738" />
        </linearGradient>
        <linearGradient id="roofGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="roofGrad2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="towerGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e2254" />
          <stop offset="100%" stopColor="#161944" />
        </linearGradient>
        <linearGradient id="domeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="flagGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="doorGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
        <radialGradient id="treeGrad">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#065f46" />
        </radialGradient>
        <radialGradient id="treeGrad2">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="70%" stopColor="#065f46" />
        </radialGradient>
      </defs>
    </svg>
  );
}
