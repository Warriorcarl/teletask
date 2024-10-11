import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Settings() {
  const router = useRouter();
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
  }, []);

  const fetchChannels = async () => {
    const res = await fetch('/api/channels', {
      headers: { 'Authorization': localStorage.getItem('token') },
    });
    const data = await res.json();
    setChannels(data.channels);
  };

  return (
    <div>
      <h1>Admin Panel</h1>
      <button onClick={fetchChannels}>Load Channels</button>
      <ul>
        {channels.map((channel) => (
          <li key={channel._id}>{channel.name}</li>
        ))}
      </ul>
    </div>
  );
}
