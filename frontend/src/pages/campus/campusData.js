import { useEffect, useState } from 'react';

export const API = window.location.origin;
export const tours = [
  { id: 'campus', name: 'Grand Campus Overview', short: 'The Great Science Quad Adventure', image: '/hero-campus.jpg', theme: 'Science', duration: 45, description: 'Join us for a comprehensive journey through the heart of our research facilities. Discover the cutting-edge ideas and inspiring spaces that bring our campus to life.' },
  { id: 'heritage', name: 'Historical Architecture Walk', image: '/poi-library.jpg', theme: 'History', duration: 40, description: 'Explore the rich heritage and classic architectural marvels of the main campus, including the iconic central library.' },
  { id: 'innovation', name: 'Engineering Complex & Innovation Labs', short: 'Tech & Innovation Hub', image: '/tour-labs.jpg', theme: 'Science', duration: 50, description: 'A focused tour through the engineering and computer science facilities, showcasing state-of-the-art labs.' },
  { id: 'garden', name: 'Garden & Nature Trail', image: '/tour-garden.jpg', theme: 'Nature', duration: 25, description: 'Take the scenic route. Discover quiet gardens, open green spaces and a different side of campus life.' }
];
export const destinations = [
  { name: 'Main Library', image: '/poi-library.jpg', tour: 'heritage', description: 'Explore five floors of quiet study spaces, collaborative pods, and our rare books collection.' },
  { name: 'Science Center', image: '/poi-innovation.jpg', tour: 'innovation', description: 'Discover research spaces where new ideas take shape and students build the future.' },
  { name: 'Student Union', image: '/poi-student-union.jpg', tour: 'campus', description: 'The social hub of campus, with dining options, student organizations and welcoming spaces.' }
];
export async function api(path, options) {
  const res = await fetch(API + '/api' + path, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Unable to connect. Please try again.');
  return data;
}
export function useSlots() {
  const [state, setState] = useState({ routes: [], timeSlots: [], loading: true, error: '' });
  useEffect(() => {
    let active = true;
    api('/tours/slots').then(data => { if (active) setState({ ...data, loading: false, error: '' }); })
      .catch(() => { if (active) setState({ routes: [], timeSlots: [], loading: false, error: 'Tour availability is temporarily unavailable. Please check that the server is running and refresh the page.' }); });
    return () => { active = false; };
  }, []);
  return state;
}

export const defaultPois = [{ name: 'Entrance Gate', x: 50, y: 80 }, { name: 'Main Hall', x: 200, y: 120 }, { name: 'Exhibition A', x: 400, y: 200 }, { name: 'Garden Area', x: 550, y: 300 }, { name: 'Museum Wing', x: 650, y: 150 }, { name: 'Exit / Gift Shop', x: 700, y: 350 }];
