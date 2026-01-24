import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    profile: {
        name: 'Nitish Kumar',
        title: 'Full Stack Developer',
        email: 'nits.kr99@gmail.com',
        bio: 'I create modern, scalable, and beautiful web applications with a focus on user experience and performance.',
    },
    projects: [
        { id: 1, title: 'FinTech Dashboard', status: 'Completed', date: '2023-10-24' },
        { id: 2, title: 'E-Commerce Platform', status: 'In Progress', date: '2023-11-02' },
    ]
};

const contentSlice = createSlice({
    name: 'content',
    initialState,
    reducers: {
        updateProfile: (state, action) => {
            state.profile = { ...state.profile, ...action.payload };
        },
        addProject: (state, action) => {
            state.projects.push(action.payload);
        },
        // Add more reducers as needed
    },
});

export const { updateProfile, addProject } = contentSlice.actions;
export default contentSlice.reducer;
