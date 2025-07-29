import { useState } from 'react';
import TabsHeader from './TabsHeader';
import TopicList from './Topicslist';
import Requests from './Requests';

export default function TopicAddtion() {
  const [activeTab, setActiveTab] = useState('requests');
  const facultyData = {
    name: "Dr. Ramesh Kumar",
    email: "ramesh.kumar@college.edu",
    topics: [
      ["Low-Cost Tech for Grassroots Impact", "Innovative and affordable tech solutions for rural and underserved communities.", "E10001"],
      ["Digital Wellbeing Tools", "Exploring technologies that promote mental well-being, enhance focus through cognitive support tools, and encourage mindful digital habits by leveraging behavioral design, biofeedback, and user-centered interaction models.", "E10002"],
      ["Remote Monitoring and Control Systems", "IoT and automation technologies for controlling devices remotely.", "E10003"],
      ["Assistive Technologies for Accessibility", "Designing inclusive solutions for people with disabilities.", "E10004"],
      ["Next-Gen Communication Platforms", "Future-facing messaging, calling, or AR/VR communication platforms.", "E10005"],
      ["Assistive Technologies for Accessibility", "Designing inclusive solutions for people with disabilities.", "E10006"],
    ]
  };
const data = {
  faculty: "64a7d2f7ab12f1a9a5c12ab4", // dummy ObjectId
  topics: [
    {
      _id: "64a7d2f7ab12f1a9a5c12ab1",
      topic: "Digital Wellbeing Tools",
      about: "Apps to enhance mental health and productivity",
      dept: "CSE"
    },
    {
      _id: "64a7d2f7ab12f1a9a5c12ab2",
      topic: "Assistive Technologies for Accessibility",
      about: "Solutions to support differently abled users",
      dept: "ECE"
    }
  ],
  requests: [
    {
      teamid: "team123",
      topic: "64a7d2f7ab12f1a9a5c12ab1",
      isapproved: false,
      teamdetails: {
        Bin1: {
          name: "Reddi Abhiram Reddi",
          roll: "S20230010210"
        },
        Bin2: {
          name: "Venkat Rahul Vempadapu",
          roll: "S20230010257"
        },
        Bin3: {
          name: "Someswarkumar Balam",
          roll: "S20230010230"
        }
      }
    },
    {
      teamid: "team456",
      topic: "64a7d2f7ab12f1a9a5c12ab2",
      isapproved: false,
      teamdetails: {
        Bin1: {
          name: "Sahal Ansar Theparambil",
          roll: "S20230010245"
        },
        Bin2: {
          name: "Shrushant Reddy",
          roll: "S20230010250"
        },
        Bin3: {
          name: "Shriansh Jain",
          roll: "S20230010260"
        }
      }
    }
  ]
};


  return (
  <div>
    <TabsHeader activeTab={activeTab} setActiveTab={setActiveTab} />
    <div className="faculty-page">
      {activeTab === 'topics' && <TopicList topics={facultyData.topics} />}
      {activeTab === 'requests' && <Requests data={data} />}
    </div>
  </div>
);

}
