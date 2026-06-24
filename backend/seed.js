/**
 * SEED.JS - Seed Database with Question Content from Screenshots
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('./models/Question');
const User = require('./models/User');
const bcrypt = require('bcrypt');

// const dbConfig = require('./config/db');

// const questions = [
//     {
//         questionText: "Explain the TCP three way handshake",
//         subject: "Computer Networks",
//         tags: ["Networking", "TCP/IP"],
//         difficulty: "Easy",
//         bloomLevel: "Understand",
//         correctAnswer: "Step 1: SYN, Step 2: SYN-ACK, Step 3: ACK",
//         explanation: "The TCP three-way handshake is a process which is used in a TCP/IP network to make a connection between the server and client. It is a three-step process that requires both the client and server to exchange synchronization and acknowledgment packets before the real data communication process starts.",
//         status: "published"
//     },
//     {
//         questionText: "What is the difference between TCP and UDP",
//         subject: "Computer Networks",
//         tags: ["Networking", "TCP/IP"],
//         difficulty: "Easy",
//         bloomLevel: "Understand",
//         correctAnswer: "TCP is connection-oriented, UDP is connectionless.",
//         explanation: "TCP provides reliable delivery and error checking, while UDP is faster but less reliable as it doesn't guarantee packet delivery or order.",
//         status: "published"
//     },
//     {
//         questionText: "Describe the OSI reference model layers",
//         subject: "Computer Networks",
//         tags: ["Networking", "Computer Networks"],
//         difficulty: "Easy",
//         bloomLevel: "Understand",
//         correctAnswer: "Physical, Data Link, Network, Transport, Session, Presentation, Application.",
//         explanation: "The Open Systems Interconnection (OSI) model describes seven layers that computer systems use to communicate over a network.",
//         status: "published"
//     },
//     {
//         questionText: "How does IP routing work in computer networks",
//         subject: "Computer Networks",
//         tags: ["Networking", "Computer Networks"],
//         difficulty: "Easy",
//         bloomLevel: "Apply",
//         correctAnswer: "Routers use routing tables to determine the next hop for a packet based on its destination IP.",
//         explanation: "IP routing is the process of sending packets from a host on one network to another host on a different remote network.",
//         status: "published"
//     },
//     {
//         questionText: "What is subnetting and why is it used",
//         subject: "Computer Networks",
//         tags: ["Subnetting", "Networking"],
//         difficulty: "Easy",
//         bloomLevel: "Apply",
//         correctAnswer: "Subnetting is the practice of dividing a network into two or more smaller networks.",
//         explanation: "It improves network performance, security, and helps in efficient IP address management.",
//         status: "published"
//     },
//     {
//         questionText: "Explain CPU process scheduling algorithms",
//         subject: "Operating Systems",
//         tags: ["Operating Systems", "Processes"],
//         difficulty: "Easy",
//         bloomLevel: "Understand",
//         correctAnswer: "FCFS, SJF, Priority, Round Robin.",
//         explanation: "Process scheduling algorithms are used by the OS to decide which process will run next on the CPU.",
//         status: "published"
//     },
//     {
//         questionText: "What is a deadlock and how can it be avoided",
//         subject: "Operating Systems",
//         tags: ["Operating Systems", "Concurrency"],
//         difficulty: "Medium",
//         bloomLevel: "Understand",
//         correctAnswer: "A state where processes are waiting for each other to release resources.",
//         explanation: "Deadlock can be avoided using Bankers Algorithm, resource ordering, or by ensuring one of the Coffman conditions does not hold.",
//         status: "published"
//     },
//     {
//         questionText: "Describe paging and segmentation in memory management",
//         subject: "Operating Systems",
//         tags: ["Systems", "Memory"],
//         difficulty: "Easy",
//         bloomLevel: "Understand",
//         correctAnswer: "Paging uses fixed-size blocks, Segmentation uses variable-size blocks.",
//         explanation: "Paging avoids external fragmentation, while segmentation matches the programmer's view of the program.",
//         status: "published"
//     },
//     {
//         questionText: "What is the difference between a process and a thread",
//         subject: "Operating Systems",
//         tags: ["Operating Systems", "Processes"],
//         difficulty: "Easy",
//         bloomLevel: "Understand",
//         correctAnswer: "A process is a program in execution, a thread is a unit of execution within a process.",
//         explanation: "Threads share the same memory space as the parent process, making communication between them more efficient.",
//         status: "published"
//     },
//     {
//         questionText: "Explain the producer consumer problem with semaphores",
//         subject: "Operating Systems",
//         tags: ["Semaphores", "Producer"],
//         difficulty: "Easy",
//         bloomLevel: "Understand",
//         correctAnswer: "Using semaphores to synchronize access to a shared buffer.",
//         explanation: "Shows how to prevent race conditions and ensure correct synchronization between concurrent processes.",
//         status: "published"
//     },
//     {
//         questionText: "What is inheritance in Java",
//         subject: "Java",
//         tags: ["Java", "OOP"],
//         difficulty: "Easy",
//         bloomLevel: "Understand",
//         correctAnswer: "A mechanism where one class acquires the properties of another class.",
//         explanation: "Supports reusability and method overriding.",
//         status: "published"
//     },
//     {
//         questionText: "Explain polymorphism with a Java example",
//         subject: "Java",
//         tags: ["Java", "OOP"],
//         difficulty: "Easy",
//         bloomLevel: "Understand",
//         correctAnswer: "Ability of an object to take on many forms.",
//         explanation: "Achieved through method overloading (compile-time) and method overriding (run-time).",
//         status: "published"
//     },
//     {
//         questionText: "How does exception handling work in Java",
//         subject: "Java",
//         tags: ["Java", "OOP"],
//         difficulty: "Easy",
//         bloomLevel: "Understand",
//         correctAnswer: "Using try, catch, finally, throw, and throws blocks.",
//         explanation: "Enables robust handling of runtime errors without crashing the program.",
//         status: "published"
//     },
//     {
//         questionText: "What is a list comprehension in Python",
//         subject: "Python",
//         tags: ["Python", "Comprehension"],
//         difficulty: "Easy",
//         bloomLevel: "Remember",
//         correctAnswer: "A concise way to create lists.",
//         explanation: "Example: [x*x for x in range(10)].",
//         status: "published"
//     },
//     {
//         questionText: "Explain decorators in Python",
//         subject: "Python",
//         tags: ["Python", "Decorators"],
//         difficulty: "Easy",
//         bloomLevel: "Understand",
//         correctAnswer: "Function that modifies the behavior of another function or class.",
//         explanation: "Uses the @ syntax above the function definition.",
//         status: "published"
//     },
//     {
//         questionText: "How do you use NumPy arrays in Python",
//         subject: "Python",
//         tags: ["Arrays", "DSA"],
//         difficulty: "Easy",
//         bloomLevel: "Apply",
//         correctAnswer: "Using import numpy as np and np.array().",
//         explanation: "NumPy arrays are faster and more memory-efficient than Python lists for numerical operations.",
//         status: "published"
//     },
//     {
//         questionText: "What is normalization in DBMS",
//         subject: "DBMS",
//         tags: ["DBMS", "Database Design"],
//         difficulty: "Medium",
//         bloomLevel: "Understand",
//         correctAnswer: "Process of organizing data to reduce redundancy.",
//         explanation: "Involves applying rules (1NF, 2NF, 3NF, BCNF) to decompose tables.",
//         status: "published"
//     },
//     {
//         questionText: "Explain the ACID properties of transactions",
//         subject: "DBMS",
//         tags: ["DBMS", "Transactions"],
//         difficulty: "Easy",
//         bloomLevel: "Understand",
//         correctAnswer: "Atomicity, Consistency, Isolation, Durability.",
//         explanation: "Guarantees that database transactions are processed reliably.",
//         status: "published"
//     },
//     {
//         questionText: "Write a SQL query to join two tables",
//         subject: "DBMS",
//         tags: ["DBMS", "SQL"],
//         difficulty: "Easy",
//         bloomLevel: "Understand",
//         correctAnswer: "SELECT * FROM t1 JOIN t2 ON t1.id = t2.id;",
//         explanation: "Joins are used to combine records from multiple tables based on a related column.",
//         status: "published"
//     },
//     {
//         questionText: "What is an index in a database and why use it",
//         subject: "DBMS",
//         tags: ["Database", "Index"],
//         difficulty: "Easy",
//         bloomLevel: "Apply",
//         correctAnswer: "Data structure that speeds up data retrieval.",
//         explanation: "Like a book index, it helps find data quickly without scanning the entire table.",
//         status: "published"
//     },
//     {
//         questionText: "Explain the binary search algorithm",
//         subject: "Data Structures",
//         tags: ["Algorithms", "Searching"],
//         difficulty: "Easy",
//         bloomLevel: "Understand",
//         correctAnswer: "Divide and conquer algorithm for finding an element in a sorted array.",
//         explanation: "Time complexity is O(log n).",
//         status: "published"
//     },
//     {
//         questionText: "What is a linked list and its types",
//         subject: "Data Structures",
//         tags: ["Linked List", "DSA"],
//         difficulty: "Easy",
//         bloomLevel: "Remember",
//         correctAnswer: "Singly, Doubly, and Circular linked lists.",
//         explanation: "A linear data structure where elements are not stored at contiguous memory locations.",
//         status: "published"
//     },
//     {
//         questionText: "Describe the difference between a stack and a queue",
//         subject: "Data Structures",
//         tags: ["Stack", "DSA"],
//         difficulty: "Easy",
//         bloomLevel: "Understand",
//         correctAnswer: "Stack is LIFO, Queue is FIFO.",
//         explanation: "Stack uses push/pop, Queue uses enqueue/dequeue.",
//         status: "published"
//     },
//     {
//         questionText: "Analyze the time complexity of merge sort and prove correctness",
//         subject: "Data Structures",
//         tags: ["Sorting", "Algorithms"],
//         difficulty: "Hard",
//         bloomLevel: "Analyze",
//         correctAnswer: "O(n log n)",
//         explanation: "Recursive divide and conquer algorithm with stable sorting.",
//         status: "published"
//     },
//     {
//         questionText: "What is a hash table and how does it handle collisions",
//         subject: "Data Structures",
//         tags: ["Hashing", "DSA"],
//         difficulty: "Easy",
//         bloomLevel: "Understand",
//         correctAnswer: "Data structure mapping keys to values using hash functions.",
//         explanation: "Collisions handled by Chaining or Open Addressing.",
//         status: "published"
//     },
//     {
//         questionText: "Design a dynamic programming solution for the knapsack problem",
//         subject: "Data Structures",
//         tags: ["Dynamic Programming", "DSA"],
//         difficulty: "Medium",
//         bloomLevel: "Create",
//         correctAnswer: "Building a 2D table to find optimal value.",
//         explanation: "Finds the maximum value of items that can be carried in a bag with a weight limit.",
//         status: "published"
//     },
//     {
//         questionText: "What is a binary search tree",
//         subject: "Data Structures",
//         tags: ["Algorithms", "Searching"],
//         difficulty: "Easy",
//         bloomLevel: "Understand",
//         correctAnswer: "A node-based binary tree where left < root < right.",
//         explanation: "Provides efficient searching, addition, and removal of items.",
//         status: "published"
//     }
// ];










const questions = [
    {
        questionText: "What is the SI unit of Force?",
        subject: "Physics",
        tags: ["Force", "Physics"],
        difficulty: "Easy",
        bloomLevel: "Remember",
        correctAnswer: "Newton",
        explanation: "Force is measured in Newton (N).",
        status: "published"
    },
    {
        questionText: "Who discovered gravity?",
        subject: "Physics",
        tags: ["Gravity", "Physics"],
        difficulty: "Easy",
        bloomLevel: "Remember",
        correctAnswer: "Newton",
        explanation: "Isaac Newton discovered the law of gravity.",
        status: "published"
    },
    {
        questionText: "What is the speed of light in vacuum?",
        subject: "Physics",
        tags: ["Light", "Physics"],
        difficulty: "Easy",
        bloomLevel: "Remember",
        correctAnswer: "3×10^8 m/s",
        explanation: "Light travels at approximately 300 million meters per second.",
        status: "published"
    },

    {
        questionText: "What is 12 × 8?",
        subject: "Mathematics",
        tags: ["Arithmetic", "Math"],
        difficulty: "Easy",
        bloomLevel: "Apply",
        correctAnswer: "96",
        explanation: "12 multiplied by 8 equals 96.",
        status: "published"
    },
    {
        questionText: "What is the square root of 64?",
        subject: "Mathematics",
        tags: ["Square Root", "Math"],
        difficulty: "Easy",
        bloomLevel: "Remember",
        correctAnswer: "8",
        explanation: "8 × 8 = 64.",
        status: "published"
    },
    {
        questionText: "What is 25% of 200?",
        subject: "Mathematics",
        tags: ["Percentage", "Math"],
        difficulty: "Easy",
        bloomLevel: "Apply",
        correctAnswer: "50",
        explanation: "25% of 200 = 50.",
        status: "published"
    },

    {
        questionText: "What is the chemical formula of water?",
        subject: "Chemistry",
        tags: ["Chemistry", "Formula"],
        difficulty: "Easy",
        bloomLevel: "Remember",
        correctAnswer: "H2O",
        explanation: "Water consists of 2 hydrogen atoms and 1 oxygen atom.",
        status: "published"
    },
    {
        questionText: "What is the symbol of Oxygen?",
        subject: "Chemistry",
        tags: ["Elements", "Chemistry"],
        difficulty: "Easy",
        bloomLevel: "Remember",
        correctAnswer: "O",
        explanation: "Oxygen's chemical symbol is O.",
        status: "published"
    },
    {
        questionText: "What is the pH of pure water?",
        subject: "Chemistry",
        tags: ["pH", "Chemistry"],
        difficulty: "Easy",
        bloomLevel: "Remember",
        correctAnswer: "7",
        explanation: "Pure water is neutral and has pH 7.",
        status: "published"
    },

    {
        questionText: "What does CPU stand for?",
        subject: "Computer Science",
        tags: ["Computer", "Hardware"],
        difficulty: "Easy",
        bloomLevel: "Remember",
        correctAnswer: "Central Processing Unit",
        explanation: "CPU is the brain of a computer.",
        status: "published"
    },
    {
        questionText: "Which data structure follows FIFO?",
        subject: "Computer Science",
        tags: ["DSA", "Queue"],
        difficulty: "Easy",
        bloomLevel: "Understand",
        correctAnswer: "Queue",
        explanation: "Queue follows First In First Out principle.",
        status: "published"
    },
    {
        questionText: "What does RAM stand for?",
        subject: "Computer Science",
        tags: ["Memory", "Computer"],
        difficulty: "Easy",
        bloomLevel: "Remember",
        correctAnswer: "Random Access Memory",
        explanation: "RAM stores temporary data used by the CPU.",
        status: "published"
    },

    {
        questionText: "Which organ pumps blood throughout the body?",
        subject: "Biology",
        tags: ["Human Body", "Heart"],
        difficulty: "Easy",
        bloomLevel: "Remember",
        correctAnswer: "Heart",
        explanation: "Heart pumps blood to all body parts.",
        status: "published"
    },
    {
        questionText: "What is the basic unit of life?",
        subject: "Biology",
        tags: ["Cell", "Biology"],
        difficulty: "Easy",
        bloomLevel: "Remember",
        correctAnswer: "Cell",
        explanation: "Cells are the basic structural and functional units of life.",
        status: "published"
    },
    {
        questionText: "Which organ helps in breathing?",
        subject: "Biology",
        tags: ["Respiratory System", "Biology"],
        difficulty: "Easy",
        bloomLevel: "Remember",
        correctAnswer: "Lungs",
        explanation: "Lungs help exchange oxygen and carbon dioxide.",
        status: "published"
    }
];

async function seed() {
    try {
        await mongoose.connect(dbConfig.mongoURI, dbConfig.mongoOptions);
        console.log('Connected to MongoDB...');

        // Clear existing data
        await Question.deleteMany({});
        console.log('Cleared existing questions.');

        // Get or Create User
        let user = await User.findOne({ email: 'sathishkumar843@gmail.com' });
        if (!user) {
            user = await User.create({
                name: "sathishkumar843",
                email: "sathishkumar843@gmail.com",
                password: "Password123!",
                role: "admin"
            });
            console.log('Created admin user: sathishkumar843');
        }

        // Add creator ID and options
        const seededQuestions = questions.map(q => ({
            ...q,
            createdBy: user._id,
            options: [
                { letter: 'A', text: q.correctAnswer },
                { letter: 'B', text: "Wrong Option 1" },
                { letter: 'C', text: "Wrong Option 2" },
                { letter: 'D', text: "Wrong Option 3" }
            ]
        }));

        await Question.insertMany(seededQuestions);
        console.log(`Successfully seeded ${seededQuestions.length} questions.`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
}

seed();
