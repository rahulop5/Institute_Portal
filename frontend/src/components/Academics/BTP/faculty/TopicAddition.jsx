import { useState } from 'react';
import TabsHeader from './TabsHeader';
import TopicList from './Topicslist';
import Requests from './Requests';

const data2={
    "phase": "FACULTY_ASSIGNMENT",
    "email": "asha.iyer@example.com",
    "message": "You have uploaded the topics",
    "topics": {
        "_id": "6870b4bcb9c64ed8cf0a6f3d",
        "faculty": "68320cfd0de2b16913af127c",
        "topics": [
            {
                "_id": "6870b4bcb9c64ed8cf0a6f3e",
                "topic": "Deployment Services",
                "about": "Its a backend service that helps to deploy things using docker etc",
                "dept": "CSE"
            },
            {
                "_id": "6875fbb6118e082940c05018",
                "topic": "Frontend Development using React",
                "about": "Its a great frontend framework that helps to render things using hooks like state etc",
                "dept": "CSE"
            },
            {
                "_id": "6875fceb118e082940c0502c",
                "topic": "Machine Learning Basics",
                "about": "An introduction to supervised and unsupervised learning techniques",
                "dept": "CSE"
            },
            {
                "_id": "6875fcf8118e082940c05035",
                "topic": "Data Structures in C++",
                "about": "Covers arrays, linked lists, stacks, queues, trees and graphs using C++",
                "dept": "CSE"
            },
            {
                "_id": "6875fd04118e082940c0503f",
                "topic": "Operating Systems",
                "about": "Focuses on process scheduling, memory management and file systems",
                "dept": "CSE"
            }
        ],
        "requests": [
            {
                "teamid": {
                    "_id": "6889c1de3e0fa2e09663f0a9",
                    "batch": "2022",
                    "bin1": {
                        "student": {
                            "name": "Vihaan Isha",
                            "email": "vihaan.isha1@example.com",
                            "rollno": "S20211001"
                        },
                        "approved": true
                    },
                    "bin2": {
                        "student": {
                            "name": "Vivaan Sneha",
                            "email": "vivaan.sneha21@example.com",
                            "rollno": "S20211021"
                        },
                        "approved": true
                    },
                    "bin3": {
                        "student": {
                            "name": "Diya Sai",
                            "email": "diya.sai38@example.com",
                            "rollno": "S20211038"
                        },
                        "approved": true
                    },
                    "isteamformed": true,
                    "__v": 0
                },
                "topic": "6870b4bcb9c64ed8cf0a6f3e",
                "isapproved": false,
                "topicDetails": {
                    "_id": "6870b4bcb9c64ed8cf0a6f3e",
                    "topic": "Deployment Services",
                    "about": "Its a backend service that helps to deploy things using docker etc",
                    "dept": "CSE"
                }
            },
            {
                "teamid": {
                    "_id": "688b07756c7f8488a91a0f89",
                    "batch": "2022",
                    "bin1": {
                        "student": {
                            "name": "Kunal Myra",
                            "email": "kunal.myra5@example.com",
                            "rollno": "S20211005"
                        },
                        "approved": true
                    },
                    "bin2": {
                        "student": {
                            "name": "Ayaan Pari",
                            "email": "ayaan.pari22@example.com",
                            "rollno": "S20211022"
                        },
                        "approved": true
                    },
                    "bin3": {
                        "student": {
                            "name": "Vihaan Aarav",
                            "email": "vihaan.aarav41@example.com",
                            "rollno": "S20211041"
                        },
                        "approved": true
                    },
                    "isteamformed": true,
                    "__v": 0
                },
                "topic": "6875fceb118e082940c0502c",
                "isapproved": false,
                "topicDetails": {
                    "_id": "6875fceb118e082940c0502c",
                    "topic": "Machine Learning Basics",
                    "about": "An introduction to supervised and unsupervised learning techniques",
                    "dept": "CSE"
                }
            },
            {
                "teamid": {
                    "_id": "688b07756c7f8488a91a0f89",
                    "batch": "2022",
                    "bin1": {
                        "student": {
                            "name": "Kunal Myra",
                            "email": "kunal.myra5@example.com",
                            "rollno": "S20211005"
                        },
                        "approved": true
                    },
                    "bin2": {
                        "student": {
                            "name": "Ayaan Pari",
                            "email": "ayaan.pari22@example.com",
                            "rollno": "S20211022"
                        },
                        "approved": true
                    },
                    "bin3": {
                        "student": {
                            "name": "Vihaan Aarav",
                            "email": "vihaan.aarav41@example.com",
                            "rollno": "S20211041"
                        },
                        "approved": true
                    },
                    "isteamformed": true,
                    "__v": 0
                },
                "topic": "6875fbb6118e082940c05018",
                "isapproved": false,
                "topicDetails": {
                    "_id": "6875fbb6118e082940c05018",
                    "topic": "Frontend Development using React",
                    "about": "Its a great frontend framework that helps to render things using hooks like state etc",
                    "dept": "CSE"
                }
            },
            {
                "teamid": {
                    "_id": "688b07756c7f8488a91a0f89",
                    "batch": "2022",
                    "bin1": {
                        "student": {
                            "name": "Kunal Myra",
                            "email": "kunal.myra5@example.com",
                            "rollno": "S20211005"
                        },
                        "approved": true
                    },
                    "bin2": {
                        "student": {
                            "name": "Ayaan Pari",
                            "email": "ayaan.pari22@example.com",
                            "rollno": "S20211022"
                        },
                        "approved": true
                    },
                    "bin3": {
                        "student": {
                            "name": "Vihaan Aarav",
                            "email": "vihaan.aarav41@example.com",
                            "rollno": "S20211041"
                        },
                        "approved": true
                    },
                    "isteamformed": true,
                    "__v": 0
                },
                "topic": "688a409f79e59b8d40f3e607",
                "isapproved": false,
                "topicDetails": null
            },
            {
                "teamid": {
                    "_id": "688b07756c7f8488a91a0f89",
                    "batch": "2022",
                    "bin1": {
                        "student": {
                            "name": "Kunal Myra",
                            "email": "kunal.myra5@example.com",
                            "rollno": "S20211005"
                        },
                        "approved": true
                    },
                    "bin2": {
                        "student": {
                            "name": "Ayaan Pari",
                            "email": "ayaan.pari22@example.com",
                            "rollno": "S20211022"
                        },
                        "approved": true
                    },
                    "bin3": {
                        "student": {
                            "name": "Vihaan Aarav",
                            "email": "vihaan.aarav41@example.com",
                            "rollno": "S20211041"
                        },
                        "approved": true
                    },
                    "isteamformed": true,
                    "__v": 0
                },
                "topic": "6875fd04118e082940c0503f",
                "isapproved": false,
                "topicDetails": {
                    "_id": "6875fd04118e082940c0503f",
                    "topic": "Operating Systems",
                    "about": "Focuses on process scheduling, memory management and file systems",
                    "dept": "CSE"
                }
            },
            {
                "teamid": {
                    "_id": "688b07756c7f8488a91a0f89",
                    "batch": "2022",
                    "bin1": {
                        "student": {
                            "name": "Kunal Myra",
                            "email": "kunal.myra5@example.com",
                            "rollno": "S20211005"
                        },
                        "approved": true
                    },
                    "bin2": {
                        "student": {
                            "name": "Ayaan Pari",
                            "email": "ayaan.pari22@example.com",
                            "rollno": "S20211022"
                        },
                        "approved": true
                    },
                    "bin3": {
                        "student": {
                            "name": "Vihaan Aarav",
                            "email": "vihaan.aarav41@example.com",
                            "rollno": "S20211041"
                        },
                        "approved": true
                    },
                    "isteamformed": true,
                    "__v": 0
                },
                "topic": "6870b4bcb9c64ed8cf0a6f3e",
                "isapproved": false,
                "topicDetails": {
                    "_id": "6870b4bcb9c64ed8cf0a6f3e",
                    "topic": "Deployment Services",
                    "about": "Its a backend service that helps to deploy things using docker etc",
                    "dept": "CSE"
                }
            }
        ],
        "__v": 24
    }
}

export default function TopicAddition({ data }) {
  const [activeTab, setActiveTab] = useState('topics');

  // Transform topics from data.topics.topics into the expected format
  const transformedTopics = data.topics.topics.map(t => [
    t.topic,
    t.about,
    t._id
  ]);

  return (
    <div>
      <TabsHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="faculty-page">
        {activeTab === 'topics' && <TopicList topics={transformedTopics} actid={data.topics._id} />}
        {activeTab === 'requests' && <Requests data={data} />}
      </div>
    </div>
  );
}
