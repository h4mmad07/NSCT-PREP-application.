# Extensive Official NSCT Question Bank Seed Data

EXTENDED_QUESTIONS = [
    # --- 1. Problem Solving & Analytical Skills (20% Weight) ---
    {
        "subject_slug": "problem-solving-analytical-skills",
        "topic_slug": "logical-reasoning-fundamentals",
        "question_text": "If all Bloops are Razzies and all Razzies are Lizzies, which of the following statements must logically be true?",
        "question_type": "single_choice",
        "difficulty": "easy",
        "explanation": "This is a classic categorical syllogism. By transitive relation, if A subset of B and B subset of C, then all A must be C (all Bloops are Lizzies).",
        "hint": "Use set theory subset relations.",
        "options": [
            {"text": "All Bloops are definitely Lizzies", "is_correct": True},
            {"text": "All Lizzies are definitely Bloops", "is_correct": False},
            {"text": "No Bloops are Lizzies", "is_correct": False},
            {"text": "Only some Razzies are Bloops", "is_correct": False}
        ]
    },
    {
        "subject_slug": "problem-solving-analytical-skills",
        "topic_slug": "mathematical-and-quantitative-reasoning",
        "question_text": "A server processing queue receives requests at an average rate of 12 requests/sec and can process 15 requests/sec. Under M/M/1 queuing theory, what is the server utilization factor (rho)?",
        "question_type": "single_choice",
        "difficulty": "medium",
        "explanation": "Server utilization rho = lambda / mu = 12 / 15 = 0.80 (80% utilization).",
        "hint": "Divide arrival rate lambda by service capacity mu.",
        "options": [
            {"text": "0.60", "is_correct": False},
            {"text": "0.75", "is_correct": False},
            {"text": "0.80", "is_correct": True},
            {"text": "1.25", "is_correct": False}
        ]
    },
    {
        "subject_slug": "problem-solving-analytical-skills",
        "topic_slug": "complexity-and-efficiency-awareness",
        "question_text": "Given the recurrence relation T(n) = 2T(n/2) + O(n), what is the tight asymptotic time complexity by Master Theorem?",
        "question_type": "single_choice",
        "difficulty": "medium",
        "explanation": "Here a=2, b=2, f(n)=n. log_b(a) = log_2(2) = 1. Since f(n) is Theta(n^1), this is Case 2 of Master Theorem: T(n) = Theta(n log n).",
        "hint": "Case 2 of Master Theorem applies when f(n) matches n^(log_b a).",
        "options": [
            {"text": "Theta(n)", "is_correct": False},
            {"text": "Theta(n log n)", "is_correct": True},
            {"text": "Theta(n^2)", "is_correct": False},
            {"text": "Theta(2^n)", "is_correct": False}
        ]
    },
    {
        "subject_slug": "problem-solving-analytical-skills",
        "topic_slug": "pattern-recognition-and-generalization",
        "question_text": "Determine the next term in the sequence: 2, 6, 12, 20, 30, 42, ?",
        "question_type": "single_choice",
        "difficulty": "easy",
        "explanation": "The terms follow n * (n + 1): 1*2=2, 2*3=6, 3*4=12, 4*5=20, 5*6=30, 6*7=42, 7*8=56.",
        "hint": "Examine differences (+4, +6, +8, +10, +12, +14) or n*(n+1).",
        "options": [
            {"text": "52", "is_correct": False},
            {"text": "54", "is_correct": False},
            {"text": "56", "is_correct": True},
            {"text": "60", "is_correct": False}
        ]
    },
    {
        "subject_slug": "problem-solving-analytical-skills",
        "topic_slug": "debugging-and-error-analysis",
        "question_text": "An algorithm searching for an element in an unsorted array of size N has a bug where it only checks even indices. What is the maximum number of false negatives this algorithm can produce?",
        "question_type": "single_choice",
        "difficulty": "easy",
        "explanation": "In an array of size N, there are floor(N/2) odd indices. If the target exists exclusively at an odd index, it will be missed.",
        "hint": "Count how many indices are skipped in array of size N.",
        "options": [
            {"text": "N / 2", "is_correct": True},
            {"text": "N - 1", "is_correct": False},
            {"text": "1", "is_correct": False},
            {"text": "0", "is_correct": False}
        ]
    },

    # --- 2. Programming [C++, Java, Python] (10% Weight) ---
    {
        "subject_slug": "programming",
        "topic_slug": "control-structures",
        "question_text": "What is the output of the following Python snippet?",
        "code_snippet": "x = [i**2 for i in range(5) if i % 2 != 0]\nprint(x)",
        "question_type": "code_output",
        "difficulty": "easy",
        "explanation": "range(5) produces 0, 1, 2, 3, 4. The odd numbers are 1 and 3. Their squares are 1^2=1 and 3^2=9 -> [1, 9].",
        "hint": "Evaluate the condition i % 2 != 0 for numbers 0 through 4.",
        "options": [
            {"text": "[1, 9]", "is_correct": True},
            {"text": "[0, 4, 16]", "is_correct": False},
            {"text": "[1, 4, 9]", "is_correct": False},
            {"text": "[1, 9, 25]", "is_correct": False}
        ]
    },
    {
        "subject_slug": "programming",
        "topic_slug": "object-oriented-programming",
        "question_text": "In Java, what happens when a subclass attempts to override a method declared as 'final' in the superclass?",
        "question_type": "single_choice",
        "difficulty": "easy",
        "explanation": "In Java, marking a method as final prevents method overriding in subclasses, resulting in a compile-time error.",
        "hint": "final keyword prevents modification or overriding.",
        "options": [
            {"text": "Compile-time error", "is_correct": True},
            {"text": "Runtime exception (FinalMethodException)", "is_correct": False},
            {"text": "Method is shadowed but allowed", "is_correct": False},
            {"text": "Warning emitted but compiles successfully", "is_correct": False}
        ]
    },
    {
        "subject_slug": "programming",
        "topic_slug": "exception-and-error-handling",
        "question_text": "In Python, which block is ALWAYS executed after try-except blocks, regardless of whether an exception occurred or was handled?",
        "question_type": "single_choice",
        "difficulty": "easy",
        "explanation": "The 'finally' clause is always executed before leaving the try-except statement, even when return or break statements are encountered.",
        "hint": "Used for resource cleanups like closing files or connections.",
        "options": [
            {"text": "else", "is_correct": False},
            {"text": "finally", "is_correct": True},
            {"text": "always", "is_correct": False},
            {"text": "catch", "is_correct": False}
        ]
    },
    {
        "subject_slug": "programming",
        "topic_slug": "concurrency-and-parallelism",
        "question_text": "In Python (CPython implementation), what mechanism prevents multiple native OS threads from executing Python bytecode in parallel on multi-core CPUs?",
        "question_type": "single_choice",
        "difficulty": "medium",
        "explanation": "The Global Interpreter Lock (GIL) is a mutex that protects access to Python objects, preventing multiple threads from executing Python bytecodes at once.",
        "hint": "GIL acronym.",
        "options": [
            {"text": "JIT Compiler", "is_correct": False},
            {"text": "Global Interpreter Lock (GIL)", "is_correct": True},
            {"text": "Garbage Collector Mark-and-Sweep", "is_correct": False},
            {"text": "Virtual Memory Manager", "is_correct": False}
        ]
    },

    # --- 3. Data Structures & Algorithms (10% Weight) ---
    {
        "subject_slug": "data-structures-algorithms",
        "topic_slug": "linear-data-structures",
        "question_text": "Which data structure allows insertion and deletion at both ends in O(1) constant time?",
        "question_type": "single_choice",
        "difficulty": "easy",
        "explanation": "A Double-Ended Queue (Deque) allows fast insertion and deletion at both the front and back in O(1) time.",
        "hint": "Double-ended queue.",
        "options": [
            {"text": "Singly Linked List", "is_correct": False},
            {"text": "Deque (Double-Ended Queue)", "is_correct": True},
            {"text": "Binary Heap", "is_correct": False},
            {"text": "Stack", "is_correct": False}
        ]
    },
    {
        "subject_slug": "data-structures-algorithms",
        "topic_slug": "searching-algorithms",
        "question_text": "What is the optimal average-case time complexity of finding the Median element in an unsorted array of size N?",
        "question_type": "single_choice",
        "difficulty": "medium",
        "explanation": "Quickselect (Hoare's selection algorithm) finds the k-th smallest element (and median) in average O(N) time.",
        "hint": "Quickselect achieves linear average time.",
        "options": [
            {"text": "O(1)", "is_correct": False},
            {"text": "O(log N)", "is_correct": False},
            {"text": "O(N)", "is_correct": True},
            {"text": "O(N log N)", "is_correct": False}
        ]
    },
    {
        "subject_slug": "data-structures-algorithms",
        "topic_slug": "hashing",
        "question_text": "In Hash Tables, what is the primary drawback of Linear Probing for open addressing collision resolution?",
        "question_type": "single_choice",
        "difficulty": "medium",
        "explanation": "Linear probing suffers from Primary Clustering, where occupied slots form continuous clusters, causing search times to degrade significantly.",
        "hint": "Clusters of contiguous occupied slots.",
        "options": [
            {"text": "Memory thrashing", "is_correct": False},
            {"text": "Primary Clustering", "is_correct": True},
            {"text": "Recursive overhead", "is_correct": False},
            {"text": "Double hashing deadlock", "is_correct": False}
        ]
    },
    {
        "subject_slug": "data-structures-algorithms",
        "topic_slug": "algorithm-design-techniques",
        "question_text": "Dijkstra's Single Source Shortest Path algorithm fails to produce correct results in the presence of:",
        "question_type": "single_choice",
        "difficulty": "easy",
        "explanation": "Dijkstra's algorithm assumes all edge weights are non-negative. It can fail and enter infinite loops if negative edge weights exist (Bellman-Ford is used for negative weights).",
        "hint": "Weights with negative values.",
        "options": [
            {"text": "Directed cycles", "is_correct": False},
            {"text": "Negative weight edges", "is_correct": True},
            {"text": "Disconnected components", "is_correct": False},
            {"text": "Multiple connected components", "is_correct": False}
        ]
    },

    # --- 4. Operating Systems (5% Weight) ---
    {
        "subject_slug": "operating-systems",
        "topic_slug": "memory-management",
        "question_text": "What phenomenon occurs in paging systems when a process spends more time swapping pages in and out of disk than executing instructions?",
        "question_type": "single_choice",
        "difficulty": "easy",
        "explanation": "Thrashing occurs when high paging activity leads to severe performance degradation as the CPU spends most of its time handling page faults.",
        "hint": "Excessive page faulting.",
        "options": [
            {"text": "External Fragmentation", "is_correct": False},
            {"text": "Thrashing", "is_correct": True},
            {"text": "Aging", "is_correct": False},
            {"text": "Starvation", "is_correct": False}
        ]
    },
    {
        "subject_slug": "operating-systems",
        "topic_slug": "concurrency-and-synchronization",
        "question_text": "Which synchronization primitive is an integer variable accessed only through atomic wait() (P) and signal() (V) operations?",
        "question_type": "single_choice",
        "difficulty": "easy",
        "explanation": "A Semaphore (Dijkstra) is an integer variable accessed through atomic P (wait) and V (signal) operations.",
        "hint": "Invented by Edsger Dijkstra.",
        "options": [
            {"text": "Monitor", "is_correct": False},
            {"text": "Semaphore", "is_correct": True},
            {"text": "Spinlock", "is_correct": False},
            {"text": "Condition Variable", "is_correct": False}
        ]
    },

    # --- 5. Software Engineering (10% Weight) ---
    {
        "subject_slug": "software-engineering",
        "topic_slug": "software-architecture",
        "question_text": "In Microservices Architecture, which pattern provides a single reverse proxy entry point for all client requests and handles routing, authentication, and SSL termination?",
        "question_type": "single_choice",
        "difficulty": "medium",
        "explanation": "The API Gateway pattern serves as a reverse proxy to route requests, aggregate services, and handle cross-cutting concerns (authentication, rate limiting, logging).",
        "hint": "Gateway pattern.",
        "options": [
            {"text": "Circuit Breaker", "is_correct": False},
            {"text": "API Gateway", "is_correct": True},
            {"text": "Service Mesh", "is_correct": False},
            {"text": "Event Sourcing", "is_correct": False}
        ]
    },
    {
        "subject_slug": "software-engineering",
        "topic_slug": "software-testing",
        "question_text": "What type of testing validates that existing functionality remains intact and unbroken after recent code changes or bug fixes?",
        "question_type": "single_choice",
        "difficulty": "easy",
        "explanation": "Regression testing ensures that previously developed and tested software continues to operate correctly after new changes or fixes are introduced.",
        "hint": "Re-testing unchanged features.",
        "options": [
            {"text": "Unit Testing", "is_correct": False},
            {"text": "Regression Testing", "is_correct": True},
            {"text": "Smoke Testing", "is_correct": False},
            {"text": "Stress Testing", "is_correct": False}
        ]
    },
    {
        "subject_slug": "software-engineering",
        "topic_slug": "software-requirements-engineering",
        "question_text": "Which requirement represents a Non-Functional Requirement (NFR) rather than a Functional Requirement?",
        "question_type": "single_choice",
        "difficulty": "easy",
        "explanation": "Response time, security, scalability, and uptime are quality attributes (Non-Functional Requirements). Generating invoices or student logins are Functional Requirements.",
        "hint": "Quality attributes like speed, reliability, and security.",
        "options": [
            {"text": "The user must be able to export grades to PDF", "is_correct": False},
            {"text": "The system must process search queries within 200 milliseconds under peak load", "is_correct": True},
            {"text": "The student can reset their forgotten password", "is_correct": False},
            {"text": "The admin can create test sessions", "is_correct": False}
        ]
    },

    # --- 6. Web Development (10% Weight) ---
    {
        "subject_slug": "web-development",
        "topic_slug": "web-architecture-and-protocols",
        "question_text": "Which HTTP status code signifies that a client must authenticate itself to get the requested response (Unauthorized)?",
        "question_type": "single_choice",
        "difficulty": "easy",
        "explanation": "HTTP 401 Unauthorized indicates missing or invalid authentication credentials. 403 Forbidden indicates authenticated but lacking permission.",
        "hint": "Standard 401 status.",
        "options": [
            {"text": "400 Bad Request", "is_correct": False},
            {"text": "401 Unauthorized", "is_correct": True},
            {"text": "403 Forbidden", "is_correct": False},
            {"text": "404 Not Found", "is_correct": False}
        ]
    },
    {
        "subject_slug": "web-development",
        "topic_slug": "javascript-fundamentals",
        "question_text": "In JavaScript, what is the value of `[1, 2, 3] + [4, 5, 6]`?",
        "question_type": "single_choice",
        "difficulty": "medium",
        "explanation": "In JavaScript, the '+' operator with arrays coerces both arrays to strings ('1,2,3' and '4,5,6') and concatenates them into '1,2,34,5,6'.",
        "hint": "Arrays are converted to comma-separated strings during concatenation.",
        "options": [
            {"text": "[1, 2, 3, 4, 5, 6]", "is_correct": False},
            {"text": "'1,2,34,5,6'", "is_correct": True},
            {"text": "NaN", "is_correct": False},
            {"text": "TypeError", "is_correct": False}
        ]
    },
    {
        "subject_slug": "web-development",
        "topic_slug": "modern-web-development-practices",
        "question_text": "In React 18, which hook is used to memoize expensive computations between re-renders?",
        "question_type": "single_choice",
        "difficulty": "easy",
        "explanation": "useMemo caches the result of a calculation between renders, while useCallback caches a function definition.",
        "hint": "Memoizes values, not functions.",
        "options": [
            {"text": "useCallback", "is_correct": False},
            {"text": "useMemo", "is_correct": True},
            {"text": "useRef", "is_correct": False},
            {"text": "useEffect", "is_correct": False}
        ]
    },

    # --- 7. AI / Machine Learning & Data Analytics (10% Weight) ---
    {
        "subject_slug": "ai-ml-data-analytics",
        "topic_slug": "unsupervised-learning",
        "question_text": "Which clustering algorithm requires specifying the number of clusters 'K' in advance and iteratively minimizes within-cluster sum of squares (inertia)?",
        "question_type": "single_choice",
        "difficulty": "easy",
        "explanation": "K-Means clustering iteratively updates centroids to minimize the within-cluster variance for a predetermined K.",
        "hint": "Centroid-based algorithm with K clusters.",
        "options": [
            {"text": "DBSCAN", "is_correct": False},
            {"text": "K-Means", "is_correct": True},
            {"text": "Agglomerative Hierarchical Clustering", "is_correct": False},
            {"text": "PCA", "is_correct": False}
        ]
    },
    {
        "subject_slug": "ai-ml-data-analytics",
        "topic_slug": "natural-language-processing",
        "question_text": "Which fundamental architectural component enables Transformer models (e.g. BERT, GPT) to process all input tokens in parallel while learning context relationships?",
        "question_type": "single_choice",
        "difficulty": "medium",
        "explanation": "The Multi-Head Self-Attention mechanism allows transformers to attend to different positions of a sequence simultaneously without sequential recurrence.",
        "hint": "'Attention is All You Need'.",
        "options": [
            {"text": "Recurrent LSTM Cells", "is_correct": False},
            {"text": "Multi-Head Self-Attention Mechanism", "is_correct": True},
            {"text": "Convolutional Strided Kernels", "is_correct": False},
            {"text": "Viterbi Decoder", "is_correct": False}
        ]
    },

    # --- 8. Cyber Security (5% Weight) ---
    {
        "subject_slug": "cyber-security",
        "topic_slug": "authentication-and-access-control",
        "question_text": "Which access control model restricts access to resources based on the sensitivity labels of objects and formal clearances of subjects (e.g. Top Secret, Secret)?",
        "question_type": "single_choice",
        "difficulty": "medium",
        "explanation": "Mandatory Access Control (MAC), such as Bell-LaPadula model, enforces access through system-defined security labels and subject clearance levels.",
        "hint": "Military-style security labels.",
        "options": [
            {"text": "Discretionary Access Control (DAC)", "is_correct": False},
            {"text": "Role-Based Access Control (RBAC)", "is_correct": False},
            {"text": "Mandatory Access Control (MAC)", "is_correct": True},
            {"text": "Attribute-Based Access Control (ABAC)", "is_correct": False}
        ]
    },
    {
        "subject_slug": "cyber-security",
        "topic_slug": "malware-and-attack-techniques",
        "question_text": "What type of cyberattack involves intercepting and potentially altering communication between two parties without either party knowing?",
        "question_type": "single_choice",
        "difficulty": "easy",
        "explanation": "A Man-in-the-Middle (MitM) attack occurs when an attacker secretly relays and alters communications between two parties who believe they are directly communicating.",
        "hint": "MitM attack.",
        "options": [
            {"text": "Denial of Service (DoS)", "is_correct": False},
            {"text": "Man-in-the-Middle (MitM)", "is_correct": True},
            {"text": "SQL Injection", "is_correct": False},
            {"text": "Cross-Site Request Forgery (CSRF)", "is_correct": False}
        ]
    },

    # --- 9. Databases (10% Weight) ---
    {
        "subject_slug": "databases",
        "topic_slug": "indexing-and-file-organization",
        "question_text": "Why are B+ Trees preferred over standard Binary Search Trees for database indexes on disk storage?",
        "question_type": "single_choice",
        "difficulty": "medium",
        "explanation": "B+ Trees have high fanout, significantly reducing tree height and the number of expensive disk I/O operations. Leaf nodes are linked for efficient range scans.",
        "hint": "High branching factor minimizes disk I/O operations.",
        "options": [
            {"text": "They occupy zero disk space", "is_correct": False},
            {"text": "High fanout minimizes tree height and disk I/O reads", "is_correct": True},
            {"text": "They eliminate all hashing collisions", "is_correct": False},
            {"text": "They allow duplicate primary keys", "is_correct": False}
        ]
    },
    {
        "subject_slug": "databases",
        "topic_slug": "nosql-and-modern-databases",
        "question_text": "According to the CAP Theorem, in the presence of a network partition (P), a distributed database system must choose between:",
        "question_type": "single_choice",
        "difficulty": "easy",
        "explanation": "The CAP theorem states that when network partitions (P) inevitably occur in a distributed system, the system can guarantee either Consistency (C) or Availability (A), but not both.",
        "hint": "Consistency (C) vs Availability (A).",
        "options": [
            {"text": "Consistency and Availability", "is_correct": True},
            {"text": "Performance and Security", "is_correct": False},
            {"text": "Atomicity and Durability", "is_correct": False},
            {"text": "Scalability and Speed", "is_correct": False}
        ]
    },

    # --- 10. Computer Networks & Cloud Computing (10% Weight) ---
    {
        "subject_slug": "computer-networks-cloud-computing",
        "topic_slug": "network-layer",
        "question_text": "Which routing protocol uses Dijkstra's Shortest Path First (SPF) algorithm and is categorized as a Link-State routing protocol?",
        "question_type": "single_choice",
        "difficulty": "medium",
        "explanation": "Open Shortest Path First (OSPF) is an Interior Gateway Protocol (IGP) based on link-state technology that runs Dijkstra's SPF algorithm. RIP is distance-vector.",
        "hint": "OSPF protocol.",
        "options": [
            {"text": "RIP (Routing Information Protocol)", "is_correct": False},
            {"text": "OSPF (Open Shortest Path First)", "is_correct": True},
            {"text": "BGP (Border Gateway Protocol)", "is_correct": False},
            {"text": "EGP", "is_correct": False}
        ]
    },
    {
        "subject_slug": "computer-networks-cloud-computing",
        "topic_slug": "data-link-layer",
        "question_text": "What is the standard length (in bits and bytes) of an Ethernet Media Access Control (MAC) address?",
        "question_type": "single_choice",
        "difficulty": "easy",
        "explanation": "A standard MAC-48 address is 48 bits (6 bytes), typically written as 12 hexadecimal digits (e.g. 00:1A:2B:3C:4D:5E).",
        "hint": "6 bytes / 48 bits.",
        "options": [
            {"text": "32 bits (4 bytes)", "is_correct": False},
            {"text": "48 bits (6 bytes)", "is_correct": True},
            {"text": "64 bits (8 bytes)", "is_correct": False},
            {"text": "128 bits (16 bytes)", "is_correct": False}
        ]
    }
]
