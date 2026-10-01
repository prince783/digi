import { ResumeData } from './types';

export const initialResume: ResumeData = {
    fullName: "Saanvi Patel",
    jobTitle: "Retail Sales Associate",
    email: "saanvipatel@sample.in",
    phone: "+91 22 1234 5677",
    location: "New Delhi, India 110034",
    city: "New Delhi",
    country: "India",
    pinCode: "110034",
    website: "",
    linkedin: "linkedin.com/in/saanvipatel",
    drivingLicence: "",
    profilePhoto: "",
    summary:
      "Motivated Sales Associate with 5 years of experience boosting sales and customer loyalty through individualized service. Resourceful expert at learning customer needs, directing to desirable merchandise and upselling to meet sales quotas. Committed to strengthening customer experiences with positivity and professionalism when answering requests and processing sales.",

    experiences: [
      {
        id: 1,
        company: "H&M",
        role: "Retail Sales Associate",
        location: "New Delhi, India",
        startDate: "2016-05",
        endDate: "Current",
        description:
          "Effectively upsold products by introducing accessories and other add-ons, adding ₹3000 to average monthly sales.\nGenerated brand awareness and positive product impressions to increase sales 22%.\nUsed consultative sales approach to understand customer needs and recommend relevant offerings.",
      },
      {
        id: 2,
        company: "Starbucks",
        role: "Barista",
        location: "New Delhi, India",
        startDate: "2015-01",
        endDate: "2016-03",
        description:
          "Created over 60 drinks per hour with consistently positive customer satisfaction scores.\nLearned every menu preparation and numerous off-label drinks to meet all customer needs.\nUpsold baked goods and extra shots with beverages, increasing store sales ₹3800 per month.",
      },
    ],

    education: [
      {
        id: 1,
        school: "Oxford Software Institute & Oxford School of English",
        degree: "Diploma: Financial Accounting",
        location: "New Delhi, India",
        startDate: "June 2016",
        endDate: "",
      },
    ],

    skills: [
      "Store opening and closing",
      "Sales expertise",
      "Accurate Money Handling",
      "Store Merchandising",
      "Loss prevention",
      "Product promotions",
    ],

    projects: [
      {
        id: 1,
        name: "Retail Sales Improvement",
        description:
          "Created a product-promotion plan that improved customer engagement and supported monthly sales targets.",
        link: "",
      },
    ],

    certifications: ["Customer Service Excellence Certificate"],

    languages: ["English", "Hindi"],
};
