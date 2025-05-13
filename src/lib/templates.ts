import { ResumeValues } from "./validation";
import { BorderStyle } from "@/app/(main)/editor/BorderStyleButton";
import { TemplateType } from "@/components/resume-templates";

// Cấu trúc cho resume template
export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  data: ResumeValues;
  templateType: TemplateType;
}

// Danh sách các template mẫu
export const resumeTemplates: ResumeTemplate[] = [
  {
    id: "blank",
    name: "Template trắng",
    description: "Bắt đầu với một template trống, tùy chỉnh theo ý của bạn",
    thumbnail: "/templates/blank.png",
    templateType: TemplateType.BLANK,
    data: {
      title: "CV của tôi",
      firstName: "",
      lastName: "",
      jobTitle: "",
      city: "",
      country: "",
      email: "",
      phone: "",
      summary: "",
      workExperiences: [],
      educations: [],
      skills: [],
      colorHex: "#2563eb",
      borderStyle: "square" as BorderStyle,
    },
  },
  {
    id: "professional",
    name: "Chuyên nghiệp",
    description:
      "Template hiện đại, chuyên nghiệp phù hợp cho hầu hết các ngành",
    thumbnail: "/templates/professional.png",
    templateType: TemplateType.PROFESSIONAL,
    data: {
      title: "CV Chuyên nghiệp",
      firstName: "Nguyễn",
      lastName: "Văn A",
      jobTitle: "Kỹ sư phần mềm",
      city: "Hà Nội",
      country: "Việt Nam",
      email: "example@email.com",
      phone: "0123456789",
      summary:
        "Kỹ sư phần mềm với 5 năm kinh nghiệm trong phát triển web và mobile. Thành thạo ReactJS, Node.js và các công nghệ hiện đại.",
      workExperiences: [
        {
          position: "Senior Frontend Developer",
          company: "Tech Company X",
          startDate: "2021-01-01",
          endDate: "2023-12-31",
          description:
            "Phát triển và duy trì các ứng dụng web với ReactJS, Redux. Tối ưu hiệu suất và cải thiện trải nghiệm người dùng.",
        },
        {
          position: "Web Developer",
          company: "Agency Y",
          startDate: "2018-06-01",
          endDate: "2020-12-31",
          description:
            "Xây dựng website cho khách hàng sử dụng HTML, CSS, JavaScript và các framework hiện đại.",
        },
      ],
      educations: [
        {
          degree: "Kỹ sư Công nghệ thông tin",
          school: "Đại học Bách Khoa Hà Nội",
          startDate: "2014-09-01",
          endDate: "2018-05-31",
        },
      ],
      skills: [
        "HTML",
        "CSS",
        "JavaScript",
        "ReactJS",
        "Node.js",
        "Git",
        "Redux",
        "TypeScript",
      ],
      colorHex: "#2563eb",
      borderStyle: "square" as BorderStyle,
    },
  },
  {
    id: "creative",
    name: "Sáng tạo",
    description:
      "Template năng động, sáng tạo phù hợp cho ngành thiết kế và marketing",
    thumbnail: "/templates/creative.png",
    templateType: TemplateType.CREATIVE,
    data: {
      title: "CV Sáng tạo",
      firstName: "Trần",
      lastName: "Thị B",
      jobTitle: "UI/UX Designer",
      city: "Hồ Chí Minh",
      country: "Việt Nam",
      email: "design@email.com",
      phone: "0987654321",
      summary:
        "Designer đam mê với 4 năm kinh nghiệm trong thiết kế UI/UX. Chuyên tạo ra các trải nghiệm người dùng đẹp mắt và trực quan.",
      workExperiences: [
        {
          position: "Senior UI/UX Designer",
          company: "Creative Studio Z",
          startDate: "2020-03-01",
          endDate: "2023-12-31",
          description:
            "Thiết kế giao diện người dùng và trải nghiệm người dùng cho các ứng dụng web và mobile. Làm việc với các stakeholder để hiểu và đáp ứng yêu cầu.",
        },
        {
          position: "Graphic Designer",
          company: "Marketing Agency W",
          startDate: "2018-01-01",
          endDate: "2020-02-28",
          description:
            "Thiết kế các tài liệu marketing, banner, logo và ấn phẩm cho khách hàng.",
        },
      ],
      educations: [
        {
          degree: "Cử nhân Thiết kế Đồ họa",
          school: "Đại học Mỹ thuật TP.HCM",
          startDate: "2014-09-01",
          endDate: "2018-05-31",
        },
      ],
      skills: [
        "Figma",
        "Adobe XD",
        "Photoshop",
        "Illustrator",
        "UI Design",
        "UX Research",
        "Wireframing",
        "Prototyping",
      ],
      colorHex: "#ec4899",
      borderStyle: "squircle" as BorderStyle,
    },
  },
  {
    id: "minimal",
    name: "Tối giản",
    description:
      "Template đơn giản và đầy đủ thông tin, phù hợp cho mọi ngành nghề",
    thumbnail: "/templates/minimal.png",
    templateType: TemplateType.BLANK,
    data: {
      title: "CV Tối giản",
      firstName: "Lê",
      lastName: "Văn C",
      jobTitle: "Project Manager",
      city: "Đà Nẵng",
      country: "Việt Nam",
      email: "manager@email.com",
      phone: "0369852147",
      summary:
        "Quản lý dự án với hơn 7 năm kinh nghiệm trong lĩnh vực công nghệ. Chuyên môn trong việc lập kế hoạch, triển khai và điều phối các dự án phát triển phần mềm quy mô lớn. Kỹ năng mạnh về lãnh đạo, giao tiếp và quản lý thời gian, giúp đội ngũ đạt hiệu suất tối đa. Có khả năng phân tích và giải quyết vấn đề phức tạp, đảm bảo dự án hoàn thành đúng tiến độ và ngân sách. Kinh nghiệm làm việc với nhiều phương pháp luận như Agile, Scrum, Waterfall.",
      workExperiences: [
        {
          position: "Senior Project Manager",
          company: "Tech Solutions Corp",
          startDate: "2019-06-01",
          endDate: "2023-12-31",
          description:
            "• Quản lý 5+ dự án phát triển phần mềm quy mô lớn từ khâu lên ý tưởng đến triển khai sản phẩm\n• Điều phối đội ngũ 15 người gồm developers, designers và QA, tăng hiệu suất làm việc lên 30%\n• Triển khai phương pháp Agile/Scrum, cải thiện chu kỳ phát triển nhanh hơn 25%\n• Quản lý ngân sách dự án lên đến 500.000 USD, tiết kiệm 15% chi phí thông qua tối ưu hóa quy trình\n• Giao tiếp trực tiếp với khách hàng, nắm bắt yêu cầu và đảm bảo sự hài lòng với tỷ lệ 95%",
        },
        {
          position: "Project Coordinator",
          company: "Digital Agency V",
          startDate: "2016-02-01",
          endDate: "2019-05-31",
          description:
            "• Hỗ trợ quản lý 10+ dự án web và mobile app cho các khách hàng doanh nghiệp\n• Lập kế hoạch, theo dõi tiến độ và báo cáo kết quả cho các bên liên quan\n• Phối hợp với đội ngũ phát triển để đảm bảo chất lượng và tiến độ dự án\n• Xây dựng và duy trì tài liệu dự án, quy trình làm việc và báo cáo trạng thái\n• Tổ chức họp sprint planning, daily standup và retrospective theo phương pháp Scrum",
        },
        {
          position: "Business Analyst",
          company: "Software Innovations Ltd",
          startDate: "2014-07-01",
          endDate: "2016-01-31",
          description:
            "• Phân tích yêu cầu kinh doanh và chuyển đổi thành đặc tả kỹ thuật\n• Tạo user stories, use cases và wireframes cho các tính năng phần mềm\n• Làm việc chặt chẽ với các bên liên quan để thu thập và làm rõ yêu cầu\n• Kiểm tra và đảm bảo chất lượng sản phẩm phù hợp với yêu cầu\n• Đào tạo người dùng về cách sử dụng phần mềm mới triển khai",
        },
      ],
      educations: [
        {
          degree: "Thạc sĩ Quản trị Kinh doanh",
          school: "Đại học Kinh tế Đà Nẵng",
          startDate: "2014-09-01",
          endDate: "2016-05-31",
        },
        {
          degree: "Cử nhân Công nghệ Thông tin",
          school: "Đại học Đà Nẵng",
          startDate: "2010-09-01",
          endDate: "2014-05-31",
        },
        {
          degree: "Chứng chỉ Quản lý Dự án Chuyên nghiệp (PMP)",
          school: "Project Management Institute",
          startDate: "2018-01-01",
          endDate: "2018-03-15",
        },
      ],
      skills: [
        "Quản lý dự án",
        "Agile/Scrum",
        "Kanban",
        "Jira",
        "MS Project",
        "Trello",
        "Asana",
        "Lãnh đạo",
        "Phân tích kinh doanh",
        "Quản lý rủi ro",
        "Đàm phán",
        "Lập kế hoạch",
        "Quản lý nguồn lực",
        "Báo cáo",
        "Office 365",
        "Tiếng Anh",
      ],
      colorHex: "#000000",
      borderStyle: "square" as BorderStyle,
    },
  },
];
