import Cron from "croner";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaArrowRight, FaFilter } from "react-icons/fa6";
import type { IApiUser } from "../../server/main";
import { FlexGrow } from "./FlexGrow";
import { User } from "./User";

enum UsersFilter {
	Off,
	Online,
	Offline,
}

export function App() {
	const [users, setUsers] = useState<IApiUser[]>([]);
	const [usersFilter, setUsersFilter] = useState(UsersFilter.Off);

	const updateUsers = useCallback(async () => {
		const res = await fetch("/api/users");
		setUsers(await res.json());
	}, [setUsers]);

	useEffect(() => {
		updateUsers();
		// every minute, 30 seconds in
		const job = Cron("30 * * * * *", updateUsers);
		return () => {
			job.stop();
		};
	}, [updateUsers]);

	const toggleFilter = useCallback(() => {
		const length = Object.keys(UsersFilter).length / 2;
		setUsersFilter((usersFilter + 1) % length);
	}, [users, setUsers, usersFilter, setUsersFilter]);

	const shownUsers = useMemo(() => {
		let outputUsers = users;

		switch (usersFilter) {
			case UsersFilter.Online:
				outputUsers = outputUsers.filter(u => u.online);
				break;
			case UsersFilter.Offline:
				outputUsers = outputUsers.filter(u => !u.online);
				break;
		}

		return outputUsers.sort((a, b) => b.minutes - a.minutes);
	}, [users, usersFilter]);

	const highestMinutes = useMemo(() => {
		let highest = 0;
		for (const user of shownUsers) {
			if (user.minutes > highest) {
				highest = user.minutes;
			}
		}
		return highest;
	}, [shownUsers]);

	const filterText = useMemo(() => {
		switch (usersFilter) {
			case UsersFilter.Off:
				return "no filter";
			case UsersFilter.Online:
				return "online only";
			case UsersFilter.Offline:
				return "offline only";
		}
	}, [usersFilter]);

	return (
		<>
			<a href="https://baltimare.pages.dev">
				<img
					css={{
						width: "calc(100vw - 16px)",
						maxWidth: 600,
						marginTop: 32,
					}}
					src="baltimare-opg.png"
				></img>
			</a>
			<div
				css={{
					marginTop: 16,
					marginBottom: 4,
					fontWeight: 800,
					fontSize: 20,
					display: "flex",
					width: "calc(100vw - 16px - 8px)",
					maxWidth: 800 - 8,
					flexDirection: "row",
					alignItems: "flex-end", // move to bottom
					justifyContent: "center",
				}}
			>
				<span css={{ opacity: 0.6 }}>{`${users.length} popens`}</span>
				<span css={{ opacity: 0.2, fontSize: 16 }}>/tourists</span>
				<span
					css={{
						display: "flex",
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "center",
						fontWeight: 800,
						opacity: 0.4,
						marginLeft: 24,
						fontSize: 16,
						cursor: "pointer",
						userSelect: "none",
					}}
					onClick={toggleFilter}
				>
					<FaFilter size={16} style={{ marginRight: 4 }} />
					{filterText}
				</span>
				<FlexGrow />
				<a
					css={{
						display: "flex",
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "center",
						fontWeight: 800,
						opacity: 0.2,
						marginRight: 80,
						fontSize: 16,
					}}
					href="https://github.com/makidoll/baltimare-leaderboard"
				>
					source code
					<FaArrowRight size={16} style={{ marginLeft: 4 }} />
				</a>
			</div>
			<div
				css={{
					display: "flex",
					flexDirection: "column",
					gap: 4,
					width: "calc(100vw - 16px)",
					maxWidth: 800,
					marginBottom: 32,
				}}
			>
				{shownUsers.map((user, i) => (
					<User
						key={i}
						i={i}
						user={user}
						highestMinutes={highestMinutes}
					/>
				))}
			</div>
		</>
	);
}
