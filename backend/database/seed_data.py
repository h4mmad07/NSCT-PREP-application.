import json
from typing import Dict, List, Any
from sqlalchemy.orm import Session
from app.models.taxonomy import Subject, Topic
from app.models.question import Question, QuestionOption, Tag
from app.models.user import User, UserProfile
from app.models.analytics import Achievement

# Complete official NSCT Subject Taxonomy definition
NSCT_TAXONOMY = [
    {
        "name": "Problem Solving & Analytical Skills",
        "slug": "problem-solving-analytical-skills",
        "weight_percentage": 20,
        "icon": "brain",
        "display_order": 1,
        "description": "Logical reasoning, algorithmic thinking, quantitative analysis, pattern recognition, and systematic problem solving.",
        "topics": [
            "Introduction to Problem Solving",
            "Problem Understanding & Analysis",
            "Logical Reasoning Fundamentals",
            "Algorithms & Flow Control",
            "Data Representation & Abstraction",
            "Pattern Recognition & Generalization",
            "Mathematical & Quantitative Reasoning",
            "Algorithmic Thinking",
            "Critical Thinking & Decision Making",
            "Debugging & Error Analysis",
            "Complexity & Efficiency Awareness",
            "Problem Solving Using Programming",
            "Data-Driven Problem Solving",
            "Creative & Innovative Thinking",
            "Real-World Problem Solving",
            "Communication & Documentation of Solutions"
        ]
    },
    {
        "name": "Programming",
        "slug": "programming",
        "weight_percentage": 10,
        "icon": "code",
        "display_order": 2,
        "description": "Core programming principles, OOP, memory management, exception handling, and best practices across C++, Java, and Python.",
        "topics": [
            "Programming Fundamentals",
            "Data Types & Variables",
            "Operators & Expressions",
            "Control Structures",
            "Functions / Methods",
            "Input / Output Handling",
            "Strings & Text Processing",
            "Arrays & Collections",
            "Object-Oriented Programming",
            "Memory Management Concepts",
            "Exception & Error Handling",
            "Modules, Packages & Libraries",
            "Advanced Programming Concepts",
            "Concurrency & Parallelism",
            "Debugging, Testing & Optimization",
            "Software Development Practices"
        ]
    },
    {
        "name": "Data Structures & Algorithms",
        "slug": "data-structures-algorithms",
        "weight_percentage": 10,
        "icon": "binary-tree",
        "display_order": 3,
        "description": "Linear and non-linear data structures, searching, sorting, graph algorithms, and algorithmic complexity.",
        "topics": [
            "Foundations",
            "Linear Data Structures",
            "Non-Linear Data Structures",
            "Searching Algorithms",
            "Sorting Algorithms",
            "Hashing",
            "Tree Algorithms",
            "Graph Algorithms",
            "Algorithm Design Techniques",
            "Advanced Data Structures",
            "String Algorithms",
            "Complexity & Optimization"
        ]
    },
    {
        "name": "Operating Systems",
        "slug": "operating-systems",
        "weight_percentage": 5,
        "icon": "cpu",
        "display_order": 4,
        "description": "Process management, CPU scheduling, deadlocks, memory management, file systems, and OS security.",
        "topics": [
            "Introduction to Operating Systems",
            "Operating System Structures",
            "Process Management",
            "CPU Scheduling",
            "Thread Management",
            "Concurrency & Synchronization",
            "Deadlocks",
            "Memory Management",
            "File System Management",
            "Secondary Storage Management",
            "Input / Output Systems",
            "Protection & Security"
        ]
    },
    {
        "name": "Software Engineering",
        "slug": "software-engineering",
        "weight_percentage": 10,
        "icon": "git-branch",
        "display_order": 5,
        "description": "Process models, Agile methodologies, requirements engineering, software architecture, testing, and SQA.",
        "topics": [
            "Introduction to Software Engineering",
            "Software Process Models",
            "Agile Software Development",
            "Software Requirements Engineering",
            "Software Project Management",
            "Software Design",
            "Software Architecture",
            "User Interface Design",
            "Software Implementation & Coding",
            "Software Testing",
            "Software Maintenance & Evolution",
            "Software Quality Assurance",
            "Software Metrics & Measurement",
            "Software Configuration Management",
            "Software Risk Management",
            "Software Security Engineering"
        ]
    },
    {
        "name": "Web Development",
        "slug": "web-development",
        "weight_percentage": 10,
        "icon": "globe",
        "display_order": 6,
        "description": "Web protocols, HTML5, CSS3, modern JavaScript, frontend frameworks, backend APIs, databases, and web security.",
        "topics": [
            "Introduction to Web Development",
            "Web Architecture & Protocols",
            "HTML Fundamentals",
            "CSS Fundamentals",
            "Advanced CSS & Responsive Design",
            "JavaScript Fundamentals",
            "Advanced JavaScript",
            "Frontend Frameworks & Libraries",
            "Backend Development Fundamentals",
            "Server-Side Programming",
            "Databases for Web Applications",
            "Web Security",
            "Web Performance & Optimization",
            "Web Testing & Debugging",
            "Deployment & Hosting",
            "Web APIs & Integration",
            "Modern Web Development Practices"
        ]
    },
    {
        "name": "AI / Machine Learning & Data Analytics",
        "slug": "ai-ml-data-analytics",
        "weight_percentage": 10,
        "icon": "sparkles",
        "display_order": 7,
        "description": "Mathematical foundations, supervised and unsupervised ML, deep learning, NLP, computer vision, and data pre-processing.",
        "topics": [
            "Introduction to AI, ML & Data Analytics",
            "Mathematical Foundations",
            "Python for AI & Data Analytics",
            "Data Collection & Pre-processing",
            "Exploratory Data Analysis",
            "Supervised Learning",
            "Ensemble Learning",
            "Unsupervised Learning",
            "Model Evaluation & Validation",
            "Feature Engineering & Selection",
            "Deep Learning Fundamentals",
            "Advanced Deep Learning",
            "Natural Language Processing",
            "Computer Vision",
            "Big Data Analytics",
            "Model Deployment & MLOps Basics",
            "AI Ethics, Security & Privacy"
        ]
    },
    {
        "name": "Cyber Security",
        "slug": "cyber-security",
        "weight_percentage": 5,
        "icon": "shield-check",
        "display_order": 8,
        "description": "Cryptographic algorithms, network security, web vulnerabilities, authentication, digital forensics, and attack prevention.",
        "topics": [
            "Introduction to Cyber Security",
            "Security Fundamentals & Principles",
            "Cryptography Basics",
            "Network Security",
            "Operating System Security",
            "Web Application Security",
            "Malware & Attack Techniques",
            "Authentication & Access Control",
            "Secure Software Development",
            "Wireless & Mobile Security",
            "Cloud & Virtualization Security",
            "Digital Forensics",
            "Incident Response & Management",
            "Security Monitoring & Auditing",
            "Cyber Laws & Ethics",
            "Emerging Trends in Cyber Security"
        ]
    },
    {
        "name": "Databases",
        "slug": "databases",
        "weight_percentage": 10,
        "icon": "database",
        "display_order": 9,
        "description": "Relational models, SQL queries, normalization, ACID transactions, indexing, concurrency control, and NoSQL systems.",
        "topics": [
            "Introduction to Database Systems",
            "Database System Architecture",
            "Data Models",
            "Relational Database Concepts",
            "Relational Algebra & Calculus",
            "Structured Query Language",
            "Advanced SQL",
            "Database Design & Normalization",
            "Transaction Management",
            "Concurrency Control",
            "Recovery Management",
            "Indexing & File Organization",
            "Query Processing & Optimization",
            "Database Security",
            "Distributed Databases",
            "NoSQL & Modern Databases",
            "Data Warehousing & Data Mining"
        ]
    },
    {
        "name": "Computer Networks & Cloud Computing",
        "slug": "computer-networks-cloud-computing",
        "weight_percentage": 10,
        "icon": "network",
        "display_order": 10,
        "description": "OSI & TCP/IP stacks, routing and switching, transport protocols, network security, and cloud infrastructure paradigms.",
        "topics": [
            "Data Communication",
            "Computer Networks",
            "Data Link Layer",
            "Network Layer",
            "Transport Layer",
            "Application Layer",
            "Wireless Networks",
            "Cloud Computing",
            "Network Security",
            "Next Generation Networks"
        ]
    }
]

# Comprehensive high-yield seed questions covering every core subject
SAMPLE_QUESTIONS = [
    # Data Structures & Algorithms
    {
        "subject_slug": "data-structures-algorithms",
        "topic_slug": "graph-algorithms",
        "question_text": "Which fundamental data structure is utilized in Breadth-First Search (BFS) graph traversal to explore nodes in level-order?",
        "question_type": "single_choice",
        "difficulty": "easy",
        "explanation": "Breadth-First Search (BFS) explores vertices level by level using a Queue (First-In, First-Out). Depth-First Search (DFS) uses a Stack or recursive call stack (LIFO).",
        "hint": "Think about First-In, First-Out (FIFO) ordering.",
        "options": [
            {"text": "Stack", "is_correct": False},
            {"text": "Queue", "is_correct": True},
            {"text": "Priority Queue", "is_correct": False},
            {"text": "Binary Search Tree", "is_correct": False}
        ]
    },
    {
        "subject_slug": "data-structures-algorithms",
        "topic_slug": "tree-algorithms",
        "question_text": "What is the worst-case time complexity of searching for an element in a standard unbalanced Binary Search Tree (BST) with N elements?",
        "question_type": "single_choice",
        "difficulty": "medium",
        "explanation": "In the worst case, an unbalanced BST degenerates into a linear linked list (skewed tree), making the search complexity O(N). In a balanced BST (like AVL or Red-Black), it is O(log N).",
        "hint": "Consider what happens when elements are inserted in already sorted order.",
        "options": [
            {"text": "O(1)", "is_correct": False},
            {"text": "O(log N)", "is_correct": False},
            {"text": "O(N)", "is_correct": True},
            {"text": "O(N log N)", "is_correct": False}
        ]
    },
    {
        "subject_slug": "data-structures-algorithms",
        "topic_slug": "sorting-algorithms",
        "question_text": "Which of the following sorting algorithms is inherently stable and guarantees O(N log N) time complexity in the worst-case scenario?",
        "question_type": "single_choice",
        "difficulty": "medium",
        "explanation": "Merge Sort guarantees O(N log N) time in worst, best, and average cases, and is a stable sorting algorithm because equal elements retain their relative order.",
        "hint": "It uses a divide-and-conquer strategy with auxiliary array merging.",
        "options": [
            {"text": "Quick Sort", "is_correct": False},
            {"text": "Merge Sort", "is_correct": True},
            {"text": "Heap Sort", "is_correct": False},
            {"text": "Selection Sort", "is_correct": False}
        ]
    },
    # Databases
    {
        "subject_slug": "databases",
        "topic_slug": "database-design-normalization",
        "question_text": "A relational table is in Third Normal Form (3NF) if and only if it is in 2NF and:",
        "question_type": "single_choice",
        "difficulty": "medium",
        "explanation": "3NF requires the table to be in 2NF and have no transitive functional dependencies (i.e. every non-prime attribute must depend directly on the primary key and not via another non-prime attribute).",
        "hint": "Think about non-key attributes depending on other non-key attributes.",
        "options": [
            {"text": "There are no partial key dependencies", "is_correct": False},
            {"text": "There are no transitive dependencies for non-prime attributes", "is_correct": True},
            {"text": "Every determinant is a candidate key (BCNF)", "is_correct": False},
            {"text": "All multivalued dependencies are eliminated", "is_correct": False}
        ]
    },
    {
        "subject_slug": "databases",
        "topic_slug": "transaction-management",
        "question_text": "In relational database ACID properties, which property ensures that the execution of concurrent transactions produces the same state as if they were executed serially?",
        "question_type": "single_choice",
        "difficulty": "easy",
        "explanation": "Isolation ensures that concurrent execution of transactions leaves the database in the same state that would have been obtained if the transactions were executed sequentially.",
        "hint": "Focus on concurrency protection.",
        "options": [
            {"text": "Atomicity", "is_correct": False},
            {"text": "Consistency", "is_correct": False},
            {"text": "Isolation", "is_correct": True},
            {"text": "Durability", "is_correct": False}
        ]
    },
    {
        "subject_slug": "databases",
        "topic_slug": "structured-query-language",
        "question_text": "Which SQL clause is used to filter grouped records produced by a GROUP BY clause?",
        "question_type": "single_choice",
        "difficulty": "easy",
        "explanation": "The HAVING clause filters aggregated groups created by GROUP BY, whereas WHERE filters individual rows before grouping.",
        "hint": "WHERE filters rows before aggregation; this clause filters after.",
        "options": [
            {"text": "WHERE", "is_correct": False},
            {"text": "HAVING", "is_correct": True},
            {"text": "FILTER", "is_correct": False},
            {"text": "ORDER BY", "is_correct": False}
        ]
    },
    # Programming
    {
        "subject_slug": "programming",
        "topic_slug": "object-oriented-programming",
        "question_text": "What output is produced by the following Python snippet?",
        "code_snippet": "class Base:\n    def show(self):\n        return 'Base'\n\nclass Derived(Base):\n    def show(self):\n        return 'Derived'\n\nobj: Base = Derived()\nprint(obj.show())",
        "question_type": "code_output",
        "difficulty": "easy",
        "explanation": "Python methods are dynamic and resolved at runtime via late binding / dynamic dispatch (polymorphism). Even though type-annotated as Base, obj references an instance of Derived, so Derived.show() is executed.",
        "hint": "Python uses dynamic dispatch based on actual runtime instance type.",
        "options": [
            {"text": "Base", "is_correct": False},
            {"text": "Derived", "is_correct": True},
            {"text": "TypeError", "is_correct": False},
            {"text": "None", "is_correct": False}
        ]
    },
    {
        "subject_slug": "programming",
        "topic_slug": "memory-management-concepts",
        "question_text": "In C++, which smart pointer allows multiple owners to share ownership of the same dynamically allocated object using reference counting?",
        "question_type": "single_choice",
        "difficulty": "medium",
        "explanation": "std::shared_pointer implements reference counting where the managed object is deleted when the last owning shared_ptr is destroyed. std::unique_ptr enforces single ownership.",
        "hint": "It manages a shared control block with an internal reference count.",
        "options": [
            {"text": "std::unique_ptr", "is_correct": False},
            {"text": "std::shared_ptr", "is_correct": True},
            {"text": "std::weak_ptr", "is_correct": False},
            {"text": "std::auto_ptr", "is_correct": False}
        ]
    },
    # Operating Systems
    {
        "subject_slug": "operating-systems",
        "topic_slug": "deadlocks",
        "question_text": "Which of the following is NOT one of the four necessary conditions for a deadlock (Coffman conditions) to occur?",
        "question_type": "single_choice",
        "difficulty": "medium",
        "explanation": "The 4 Coffman conditions are: 1) Mutual Exclusion, 2) Hold and Wait, 3) No Preemption, and 4) Circular Wait. Preemption is a deadlock PREVENTION mechanism, not a condition for deadlock.",
        "hint": "Deadlock requires that resources cannot be forcibly seized.",
        "options": [
            {"text": "Mutual Exclusion", "is_correct": False},
            {"text": "Hold and Wait", "is_correct": False},
            {"text": "Preemption of Allocated Resources", "is_correct": True},
            {"text": "Circular Wait", "is_correct": False}
        ]
    },
    {
        "subject_slug": "operating-systems",
        "topic_slug": "cpu-scheduling",
        "question_text": "Which CPU scheduling algorithm can suffer from the 'Convoy Effect' where short processes wait behind a long CPU-intensive process?",
        "question_type": "single_choice",
        "difficulty": "easy",
        "explanation": "First-Come, First-Served (FCFS) is non-preemptive and suffers from the convoy effect when a CPU-bound process holds the CPU while multiple I/O-bound processes wait.",
        "hint": "The simplest queue-based non-preemptive algorithm.",
        "options": [
            {"text": "First-Come, First-Served (FCFS)", "is_correct": True},
            {"text": "Round Robin (RR)", "is_correct": False},
            {"text": "Shortest Remaining Time First (SRTF)", "is_correct": False},
            {"text": "Multilevel Feedback Queue", "is_correct": False}
        ]
    },
    # Problem Solving & Analytical Skills
    {
        "subject_slug": "problem-solving-analytical-skills",
        "topic_slug": "logical-reasoning-fundamentals",
        "question_text": "Find the missing number in the sequence: 3, 7, 15, 31, 63, ?",
        "question_type": "single_choice",
        "difficulty": "easy",
        "explanation": "The recurrence pattern is a_n = 2 * a_(n-1) + 1 (or 2^(n+1) - 1). 63 * 2 + 1 = 127.",
        "hint": "Multiply by 2 and add 1 at each step.",
        "options": [
            {"text": "125", "is_correct": False},
            {"text": "127", "is_correct": True},
            {"text": "128", "is_correct": False},
            {"text": "131", "is_correct": False}
        ]
    },
    {
        "subject_slug": "problem-solving-analytical-skills",
        "topic_slug": "algorithmic-thinking",
        "question_text": "If a problem exhibits optimal substructure and overlapping subproblems, which algorithmic paradigm is most appropriate?",
        "question_type": "single_choice",
        "difficulty": "medium",
        "explanation": "Dynamic Programming (DP) is specifically designed for problems possessing both optimal substructure (optimal solution to problem contains optimal solutions to subproblems) and overlapping subproblems (same subproblems are solved repeatedly).",
        "hint": "Memoization and tabulation are core techniques here.",
        "options": [
            {"text": "Greedy Algorithm", "is_correct": False},
            {"text": "Divide and Conquer", "is_correct": False},
            {"text": "Dynamic Programming", "is_correct": True},
            {"text": "Branch and Bound", "is_correct": False}
        ]
    },
    # Computer Networks & Cloud Computing
    {
        "subject_slug": "computer-networks-cloud-computing",
        "topic_slug": "transport-layer",
        "question_text": "Which mechanism does TCP use to establish a reliable connection between client and server before transmitting data?",
        "question_type": "single_choice",
        "difficulty": "easy",
        "explanation": "TCP establishes connections using a Three-Way Handshake: SYN -> SYN-ACK -> ACK.",
        "hint": "SYN and ACK packet sequence.",
        "options": [
            {"text": "Two-Way Handshake", "is_correct": False},
            {"text": "Three-Way Handshake (SYN, SYN-ACK, ACK)", "is_correct": True},
            {"text": "Sliding Window Protocol", "is_correct": False},
            {"text": "DNS Resolution", "is_correct": False}
        ]
    },
    {
        "subject_slug": "computer-networks-cloud-computing",
        "topic_slug": "cloud-computing",
        "question_text": "Which cloud service model provides virtualized hardware, storage, and networking while leaving OS installation, middleware, and applications to the customer?",
        "question_type": "single_choice",
        "difficulty": "easy",
        "explanation": "Infrastructure as a Service (IaaS) provides raw compute, storage, and networking resources (e.g., AWS EC2, Azure VMs).",
        "hint": "Examples include AWS EC2 and Google Compute Engine.",
        "options": [
            {"text": "SaaS (Software as a Service)", "is_correct": False},
            {"text": "PaaS (Platform as a Service)", "is_correct": False},
            {"text": "IaaS (Infrastructure as a Service)", "is_correct": True},
            {"text": "FaaS (Function as a Service)", "is_correct": False}
        ]
    },
    # Web Development
    {
        "subject_slug": "web-development",
        "topic_slug": "web-security",
        "question_text": "Which security header or mechanism helps protect modern web applications against Cross-Site Scripting (XSS) by restricting where scripts can be loaded from?",
        "question_type": "single_choice",
        "difficulty": "medium",
        "explanation": "Content Security Policy (CSP) is an HTTP header that allows site operators to restrict the resources (scripts, images, stylesheets) that the browser is allowed to load.",
        "hint": "CSP HTTP Response Header.",
        "options": [
            {"text": "CORS (Cross-Origin Resource Sharing)", "is_correct": False},
            {"text": "CSP (Content Security Policy)", "is_correct": True},
            {"text": "X-Frame-Options", "is_correct": False},
            {"text": "Strict-Transport-Security", "is_correct": False}
        ]
    },
    {
        "subject_slug": "web-development",
        "topic_slug": "advanced-javascript",
        "question_text": "In JavaScript, what is the output of `typeof (function(){})` and `typeof null`?",
        "question_type": "single_choice",
        "difficulty": "medium",
        "explanation": "In JavaScript, functions return 'function' while `typeof null` returns 'object' (a well-known historical bug in JavaScript that remains for backward compatibility).",
        "hint": "Null is notoriously typed as object.",
        "options": [
            {"text": "'object' and 'null'", "is_correct": False},
            {"text": "'function' and 'object'", "is_correct": True},
            {"text": "'function' and 'null'", "is_correct": False},
            {"text": "'object' and 'object'", "is_correct": False}
        ]
    },
    # AI / Machine Learning & Data Analytics
    {
        "subject_slug": "ai-ml-data-analytics",
        "topic_slug": "supervised-learning",
        "question_text": "Which metric is most appropriate for evaluating a classification model on an imbalanced dataset where the positive class is very rare?",
        "question_type": "single_choice",
        "difficulty": "medium",
        "explanation": "On imbalanced datasets, raw Accuracy is misleading. F1-Score (the harmonic mean of Precision and Recall) or PR-AUC provides a much more reliable measurement of model quality.",
        "hint": "Harmonic mean of precision and recall.",
        "options": [
            {"text": "Accuracy", "is_correct": False},
            {"text": "F1-Score", "is_correct": True},
            {"text": "Mean Squared Error", "is_correct": False},
            {"text": "R-Squared", "is_correct": False}
        ]
    },
    {
        "subject_slug": "ai-ml-data-analytics",
        "topic_slug": "deep-learning-fundamentals",
        "question_text": "Which activation function is most widely used in hidden layers of modern deep neural networks to mitigate the vanishing gradient problem?",
        "question_type": "single_choice",
        "difficulty": "easy",
        "explanation": "ReLU (Rectified Linear Unit, f(x) = max(0, x)) has constant derivative (1 for positive inputs), preventing gradient vanishing during backpropagation.",
        "hint": "f(x) = max(0, x)",
        "options": [
            {"text": "Sigmoid", "is_correct": False},
            {"text": "Tanh", "is_correct": False},
            {"text": "ReLU (Rectified Linear Unit)", "is_correct": True},
            {"text": "Softmax", "is_correct": False}
        ]
    },
    # Cyber Security
    {
        "subject_slug": "cyber-security",
        "topic_slug": "cryptography-basics",
        "question_text": "Which algorithm is an example of an Asymmetric (Public Key) Cryptographic algorithm?",
        "question_type": "single_choice",
        "difficulty": "easy",
        "explanation": "RSA is an asymmetric algorithm using mathematically linked public and private key pairs. AES, DES, and 3DES are symmetric ciphers.",
        "hint": "Named after Rivest, Shamir, and Adleman.",
        "options": [
            {"text": "AES (Advanced Encryption Standard)", "is_correct": False},
            {"text": "RSA", "is_correct": True},
            {"text": "DES", "is_correct": False},
            {"text": "ChaCha20", "is_correct": False}
        ]
    },
    # Software Engineering
    {
        "subject_slug": "software-engineering",
        "topic_slug": "agile-software-development",
        "question_text": "In Scrum methodology, which event is held at the end of a sprint for the team to inspect itself and create a plan for improvements during the next sprint?",
        "question_type": "single_choice",
        "difficulty": "easy",
        "explanation": "The Sprint Retrospective is dedicated to evaluating what went well, what could be improved, and committing to process improvements in the next sprint. Sprint Review demoes the product to stakeholders.",
        "hint": "Focus on team process reflection, not stakeholder demo.",
        "options": [
            {"text": "Sprint Review", "is_correct": False},
            {"text": "Sprint Retrospective", "is_correct": True},
            {"text": "Daily Standup", "is_correct": False},
            {"text": "Backlog Refinement", "is_correct": False}
        ]
    },
    {
        "subject_slug": "software-engineering",
        "topic_slug": "software-design",
        "question_text": "Which SOLID design principle states that software entities (classes, modules, functions) should be open for extension, but closed for modification?",
        "question_type": "single_choice",
        "difficulty": "easy",
        "explanation": "The Open/Closed Principle (OCP) states that classes should be open for extension (e.g. via inheritance or polymorphism) but closed for modification of existing source code.",
        "hint": "The 'O' in SOLID.",
        "options": [
            {"text": "Single Responsibility Principle", "is_correct": False},
            {"text": "Open/Closed Principle", "is_correct": True},
            {"text": "Liskov Substitution Principle", "is_correct": False},
            {"text": "Dependency Inversion Principle", "is_correct": False}
        ]
    }
]

ACHIEVEMENTS_DATA = [
    {
        "name": "First Step",
        "slug": "first-step",
        "description": "Completed your first practice test on NSCT Prep",
        "icon": "flag",
        "criteria_type": "tests_completed",
        "criteria_value": 1
    },
    {
        "name": "Consistency Champion",
        "slug": "7-day-streak",
        "description": "Maintained a 7-day preparation streak",
        "icon": "flame",
        "criteria_type": "streak_days",
        "criteria_value": 7
    },
    {
        "name": "Century Club",
        "slug": "100-questions",
        "description": "Answered over 100 questions across competencies",
        "icon": "book-open",
        "criteria_type": "questions_count",
        "criteria_value": 100
    },
    {
        "name": "Sharpshooter",
        "slug": "90-accuracy",
        "description": "Achieved 90%+ accuracy on a test of at least 30 questions",
        "icon": "target",
        "criteria_type": "test_accuracy",
        "criteria_value": 90
    },
    {
        "name": "DSA Master",
        "slug": "dsa-master",
        "description": "Achieved 80%+ accuracy across all DSA topics",
        "icon": "trophy",
        "criteria_type": "topic_mastery",
        "criteria_value": 80
    }
]

def seed_database(db: Session):
    """
    Seeds the complete NSCT taxonomy, topics, sample questions, and initial achievements.
    """
    # 1. Seed Subjects & Topics
    slug_to_subject: Dict[str, Subject] = {}
    slug_to_topic: Dict[str, Topic] = {}

    for s_data in NSCT_TAXONOMY:
        subject = db.query(Subject).filter(Subject.slug == s_data["slug"]).first()
        if not subject:
            subject = Subject(
                name=s_data["name"],
                slug=s_data["slug"],
                description=s_data["description"],
                weight_percentage=s_data["weight_percentage"],
                icon=s_data["icon"],
                display_order=s_data["display_order"],
                is_active=True
            )
            db.add(subject)
            db.flush()
        slug_to_subject[s_data["slug"]] = subject

        # Seed Topics
        for t_idx, topic_name in enumerate(s_data["topics"], start=1):
            t_slug = topic_name.lower().replace(" ", "-").replace("&", "and").replace("/", "-").replace(",", "")
            topic = db.query(Topic).filter(Topic.subject_id == subject.id, Topic.name == topic_name).first()
            if not topic:
                topic = Topic(
                    subject_id=subject.id,
                    name=topic_name,
                    slug=t_slug,
                    display_order=t_idx,
                    is_active=True
                )
                db.add(topic)
                db.flush()
            slug_to_topic[f"{s_data['slug']}:{t_slug}"] = topic

    # 2. Seed Achievements
    for ach in ACHIEVEMENTS_DATA:
        existing = db.query(Achievement).filter(Achievement.slug == ach["slug"]).first()
        if not existing:
            db.add(Achievement(**ach))

    # 3. Seed Primary Owner / Admin User
    admin_user = db.query(User).filter(User.email == "mh9456605@gmail.com").first()
    if not admin_user:
        admin_user = User(
            email="mh9456605@gmail.com",
            name="Muhammad Hammad",
            role="admin",
            status="active"
        )
        db.add(admin_user)
        db.flush()
        db.add(UserProfile(
            user_id=admin_user.id,
            university="National University of Computer & Emerging Sciences (FAST)",
            department="Computer Science",
            semester=7,
            graduation_year=2026,
            target_score=85,
            preparation_goal="pass_nsct",
            daily_study_target_minutes=45
        ))

    # 4. Seed Questions
    try:
        from database.questions_bank import EXTENDED_QUESTIONS
        all_questions = SAMPLE_QUESTIONS + EXTENDED_QUESTIONS
    except Exception:
        all_questions = SAMPLE_QUESTIONS

    for q_data in all_questions:
        subj = slug_to_subject.get(q_data["subject_slug"])
        if not subj:
            continue
        
        # Find topic
        topic = db.query(Topic).filter(Topic.subject_id == subj.id).first()
        # Match topic by slug or first topic
        for t in subj.topics:
            if q_data["topic_slug"] in t.slug or t.slug in q_data["topic_slug"]:
                topic = t
                break

        # Check if question already exists
        existing_q = db.query(Question).filter(Question.question_text == q_data["question_text"]).first()
        if not existing_q:
            q = Question(
                subject_id=subj.id,
                topic_id=topic.id,
                question_text=q_data["question_text"],
                question_type=q_data.get("question_type", "single_choice"),
                difficulty=q_data.get("difficulty", "medium"),
                code_snippet=q_data.get("code_snippet"),
                explanation=q_data.get("explanation"),
                hint=q_data.get("hint"),
                status="published",
                created_by=admin_user.id
            )
            db.add(q)
            db.flush()

            for opt_idx, opt in enumerate(q_data["options"], start=1):
                db.add(QuestionOption(
                    question_id=q.id,
                    option_text=opt["text"],
                    is_correct=opt["is_correct"],
                    display_order=opt_idx
                ))

    db.commit()
    print("Database successfully seeded with 10 official NSCT subjects, 150+ topics, sample questions, and achievements!")
