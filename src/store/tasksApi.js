import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

export const tasksApi = createApi({
  reducerPath: "tasksApi",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    getTasks: builder.query({
      async queryFn() {
        try {
          const querySnapshot = await getDocs(collection(db, "tasks"));
          const tasks = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          return { data: tasks };
        } catch (error) {
          return { error };
        }
      },
    }),

    addTask: builder.mutation({
      async queryFn(newTask) {
        try {
          const docRef = await addDoc(collection(db, "tasks"), newTask);
          return { data: { id: docRef.id, ...newTask } };
        } catch (error) {
          return { error };
        }
      },
    }),

    deleteTask: builder.mutation({
      async queryFn(taskId) {
        try {
          await deleteDoc(doc(db, "tasks", taskId));
          return { data: taskId };
        } catch (error) {
          return { error };
        }
      },
    }),

    toggleTask: builder.mutation({
      async queryFn({ id, completed }) {
        try {
          const ref = doc(db, "tasks", id);
          await updateDoc(ref, { completed: !completed });
          return { data: id };
        } catch (error) {
          return { error };
        }
      },
    }),
  }),
});

export const {
  useGetTasksQuery,
  useAddTaskMutation,
  useDeleteTaskMutation,
  useToggleTaskMutation,
} = tasksApi;
