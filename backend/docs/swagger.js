import swaggerJSDoc from 'swagger-jsdoc';

const PORT = process.env.PORT || 8000;
const COOKIE_NAME = process.env.COOKIE_NAME || 'truewrite_cookie';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TrueWrite API',
      version: '1.0.0',
      description: 'OpenAPI (Swagger) dokumentacija za TrueWrite backend.',
    },
    servers: [{ url: `http://localhost:${PORT}`, description: 'Local' }],

    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management endpoints (admin)' },
      {
        name: 'Works',
        description: 'Work CRUD + listing (student/teacher/admin)',
      },
      { name: 'Grades', description: 'Grading endpoints (teacher)' },
      {
        name: 'PlagiarismReports',
        description: 'Plagiarism reports endpoints',
      },
      { name: 'AIReports', description: 'AI reports endpoints' },
      { name: 'Admin', description: 'Admin dashboard analytics endpoints' },
    ],

    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: COOKIE_NAME,
        },
      },

      schemas: {
        Error: {
          type: 'object',
          properties: { message: { type: 'string' } },
        },

        // ---------- AUTH ----------
        RegisterRequest: {
          type: 'object',
          required: ['fullName', 'email', 'password'],
          properties: {
            fullName: { type: 'string', example: 'Nikola Raičević' },
            email: {
              type: 'string',
              format: 'email',
              example: 'test@mail.com',
            },
            password: { type: 'string', example: 'StrongPass123!' },
          },
        },

        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'test@mail.com',
            },
            password: { type: 'string', example: 'StrongPass123!' },
          },
        },

        // ---------- USER ----------
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'ckx...cuid' },
            fullName: { type: 'string', example: 'Nikola Raičević' },
            email: {
              type: 'string',
              format: 'email',
              example: 'test@mail.com',
            },
            role: {
              type: 'string',
              enum: ['student', 'teacher', 'admin'],
              example: 'student',
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        UpdateUserRoleRequest: {
          type: 'object',
          required: ['role'],
          properties: {
            role: {
              type: 'string',
              enum: ['student', 'teacher', 'admin'],
              example: 'teacher',
            },
          },
        },

        // ---------- WORK ----------
        WorkStatus: {
          type: 'string',
          enum: ['pending_review', 'in_review', 'graded', 'rejected'],
          example: 'pending_review',
        },

        Work: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'ckx...cuid' },
            studentId: { type: 'string', example: 'ckx...studentCuid' },
            title: { type: 'string', example: 'Seminarski rad iz ITEH' },
            subject: { type: 'string', example: 'Internet tehnologije' },
            description: {
              type: 'string',
              nullable: true,
              example: 'Opis rada...',
            },
            fileUrl: {
              type: 'string',
              example: 'https://res.cloudinary.com/.../file.pdf',
            },
            status: { $ref: '#/components/schemas/WorkStatus' },
            submittedAt: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },

            student: {
              type: 'object',
              nullable: true,
              properties: {
                id: { type: 'string' },
                fullName: { type: 'string' },
                email: { type: 'string' },
                role: { type: 'string' },
              },
            },
          },
        },

        UpdateWorkRequest: {
          type: 'object',
          properties: {
            title: { type: 'string', example: 'Novi naslov' },
            subject: { type: 'string', example: 'Novi predmet' },
            description: {
              type: 'string',
              nullable: true,
              example: 'Izmenjen opis',
            },
            fileUrl: { type: 'string', example: 'https://...' },
          },
        },

        // ---------- GRADE ----------
        Grade: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'ckx...cuid' },
            workId: { type: 'string', example: 'ckx...workCuid' },
            teacherId: { type: 'string', example: 'ckx...teacherCuid' },
            gradeValue: {
              type: 'integer',
              minimum: 1,
              maximum: 10,
              example: 8,
            },
            comment: {
              type: 'string',
              nullable: true,
              example: 'Dobar rad, par sugestija...',
            },
            gradedAt: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },

            teacher: {
              type: 'object',
              nullable: true,
              properties: {
                id: { type: 'string' },
                fullName: { type: 'string' },
                email: { type: 'string' },
                role: { type: 'string' },
              },
            },

            work: {
              type: 'object',
              nullable: true,
              properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                subject: { type: 'string' },
                studentId: { type: 'string' },
              },
            },
          },
        },

        CreateGradeRequest: {
          type: 'object',
          required: ['workId', 'gradeValue'],
          properties: {
            workId: { type: 'string', example: 'ckx...workCuid' },
            gradeValue: {
              type: 'integer',
              minimum: 1,
              maximum: 10,
              example: 8,
            },
            comment: { type: 'string', nullable: true, example: 'Komentar...' },
          },
        },

        UpdateGradeRequest: {
          type: 'object',
          properties: {
            gradeValue: {
              type: 'integer',
              minimum: 1,
              maximum: 10,
              example: 9,
            },
            comment: {
              type: 'string',
              nullable: true,
              example: 'Ažuriran komentar...',
            },
          },
        },

        // ---------- PLAGIARISM REPORT ----------
        PlagiarismSource: {
          type: 'object',
          additionalProperties: true,
          example: { url: 'https://example.com', similarity: 0.22 },
        },

        PlagiarismReport: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'ckx...cuid' },
            workId: { type: 'string', example: 'ckx...workCuid' },
            similarityPercentage: { type: 'number', example: 23.5 },
            sources: {
              type: 'array',
              items: { $ref: '#/components/schemas/PlagiarismSource' },
            },
            reportUrl: {
              type: 'string',
              example: 'https://plagiarismcheck.org/report/...',
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },

        CreatePlagiarismReportRequest: {
          type: 'object',
          required: ['workId'],
          properties: {
            workId: { type: 'string', example: 'ckx...workCuid' },
          },
        },

        // ---------- AI REPORT ----------
        AIReport: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'ckx...cuid' },
            workId: { type: 'string', example: 'ckx...workCuid' },
            aiScore: { type: 'number', example: 78.2 },
            summary: {
              type: 'string',
              nullable: true,
              example: 'Kratak rezime rada...',
            },
            reccomendations: {
              type: 'string',
              nullable: true,
              example: 'Preporuke za poboljšanje...',
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },

        CreateAIReportRequest: {
          type: 'object',
          required: ['workId'],
          properties: {
            workId: { type: 'string', example: 'ckx...workCuid' },
          },
        },

        // ---------- ADMIN STATS ----------
        AdminStatsResponse: {
          type: 'object',
          properties: {
            kpis: {
              type: 'object',
              properties: {
                usersTotal: { type: 'integer', example: 120 },
                worksTotal: { type: 'integer', example: 75 },
                usersByRole: {
                  type: 'object',
                  properties: {
                    student: { type: 'integer', example: 100 },
                    teacher: { type: 'integer', example: 15 },
                    admin: { type: 'integer', example: 5 },
                  },
                },
                worksByStatus: {
                  type: 'object',
                  properties: {
                    pending_review: { type: 'integer', example: 30 },
                    in_review: { type: 'integer', example: 10 },
                    graded: { type: 'integer', example: 25 },
                    rejected: { type: 'integer', example: 10 },
                  },
                },
              },
            },
            charts: {
              type: 'object',
              properties: {
                submissionsByDay: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      date: { type: 'string', example: '2026-02-15' },
                      count: { type: 'integer', example: 3 },
                    },
                  },
                },
                worksBySubject: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      subject: { type: 'string', example: 'ITEH' },
                      count: { type: 'integer', example: 12 },
                    },
                  },
                },
                gradeDistribution: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      grade: { type: 'integer', example: 8 },
                      count: { type: 'integer', example: 9 },
                    },
                  },
                },
                aiScoreDistribution: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      range: { type: 'string', example: '70-79' },
                      count: { type: 'integer', example: 6 },
                    },
                  },
                },
                plagiarismDistribution: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      range: { type: 'string', example: '20-29' },
                      count: { type: 'integer', example: 4 },
                    },
                  },
                },
              },
            },
            aggregates: {
              type: 'object',
              properties: {
                grades: {
                  type: 'object',
                  properties: {
                    totalGradedWorks: { type: 'integer', example: 30 },
                    avgGrade: { type: 'number', example: 7.8 },
                    distribution: { type: 'array' },
                  },
                },
                ai: {
                  type: 'object',
                  properties: {
                    totalAIReports: { type: 'integer', example: 25 },
                    avgAiScore: { type: 'number', example: 73.1 },
                    distribution: { type: 'array' },
                  },
                },
                plagiarism: {
                  type: 'object',
                  properties: {
                    totalPlagiarismReports: { type: 'integer', example: 25 },
                    avgSimilarity: { type: 'number', example: 18.4 },
                    distribution: { type: 'array' },
                  },
                },
              },
            },
            range: {
              type: 'object',
              properties: {
                from: { type: 'string', format: 'date-time' },
                to: { type: 'string', format: 'date-time' },
                days: { type: 'integer', example: 14 },
              },
            },
          },
        },
      },
    },
  },

  apis: ['./routes/*.js'],
};

export const swaggerSpec = swaggerJSDoc(options);