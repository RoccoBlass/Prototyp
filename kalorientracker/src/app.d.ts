// See https://svelte.dev/docs/kit/types#app.d.ts for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user: {
				id: string;
				email: string;
				name: string;
				calorieGoal: number;
				proteinGoal: number;
				carbsGoal: number;
				fatGoal: number;
				sex: 'male' | 'female' | null;
				age: number | null;
				height: number | null;
				weight: number | null;
				activityLevel: string | null;
				goal: string | null;
				theme: 'light' | 'dark';
				onboarded: boolean;
			} | null;
		}
	}
}

export {};
