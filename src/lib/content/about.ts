/**
 * Static branch content for the /about page.
 *
 * This is authored here until an exec-editable CMS is built in a later phase.
 * A CMS import will replace this constant, so nothing in the page component
 * needs to change — only this file.
 */

export type Department = {
  name: string;
  slug: string;
  description: string;
};

export type ExecMember = {
  name: string;
  title: string;
};

export type BranchContent = {
  shortName: string;
  fullName: string;
  institution: string;
  description: string;
  mission: string;
  departments: Department[];
  activities: { title: string; body: string }[];
  execTeam: ExecMember[];
};

export const BRANCH_CONTENT: BranchContent = {
  shortName: "NiMechE-SF",
  fullName: "Nigerian Institution of Mechanical Engineers — Student Forum",
  institution: "Abiola Ajimobi Technical University (AATU), also known as Tech-U",
  description:
    "The NiMechE Student Forum at Abiola Ajimobi Technical University (AATU), also known as Tech-U, is the student arm of the Nigerian Institution of Mechanical Engineers. We connect mechanical and mechatronics students with industry, deepen their practical skills, and build a professional network that outlasts graduation.",
  mission:
    "To develop technically excellent, professionally aware, and industry-ready engineers through hands-on activities, peer learning, and sustained engagement with the profession.",
  departments: [
    {
      name: "Mechanical Engineering",
      slug: "mechanical",
      description:
        "Our largest faculty. Students cover thermodynamics, solid mechanics, fluid mechanics, machine design and manufacturing. The branch runs plant visits and CAD clinics designed around the 300–500 level curriculum.",
    },
    {
      name: "Mechatronics Engineering",
      slug: "mechatronics",
      description:
        "Covers control systems, robotics, embedded systems and industrial automation alongside the core mechanical curriculum. Mechatronics students lead most of the branch's build projects.",
    },
  ],
  activities: [
    {
      title: "Plant visits",
      body: "We take members to working industrial facilities — steel mills, bottling plants, power stations. These are not tours: members write up what they observed, and the observation counts toward their session record.",
    },
    {
      title: "Workshops and clinics",
      body: "Practical sessions on CAD, FEA, welding and non-destructive testing, usually on Saturday mornings in the university labs. All sessions are hands-on. No slides.",
    },
    {
      title: "Competitions",
      body: "The branch enters the NSE Design Competition every year, and members who participate through to the national stage receive a verified skill on their record.",
    },
  ],
  execTeam: [],
};
