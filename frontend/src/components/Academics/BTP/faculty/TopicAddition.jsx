import { useState } from 'react';
import TabsHeader from './TabsHeader';
import TopicList from './Topicslist';
import Requests from './Requests';

export default function TopicAddition({ data }) {
  const [activeTab, setActiveTab] = useState('requests');

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
        {activeTab === 'topics' && <TopicList topics={transformedTopics} />}
        {activeTab === 'requests' && <Requests data={data} />}
      </div>
    </div>
  );
}
