"use client";

import Image from "next/image";
import { Dispatch, SetStateAction, useState } from "react";

export default function Portfolio() {
	const [selectedTab, setSelectedTab] = useState("ICE Play");

	return (
		<>
			<div className="rounded-md bg-gray-700 w-[90%] md:w-[80%] h-[80vh] border-2 relative shadow-lg mx-auto mb-10 overflow-clip">
				<div className="flex gap-3 my-3 ml-3">
					<div className="w-3 h-3 md:w-5 md:h-5 bg-red-400 rounded-full" />
					<div className="w-3 h-3 md:w-5 md:h-5 bg-yellow-400 rounded-full" />
					<div className="w-3 h-3 md:w-5 md:h-5 bg-green-400 rounded-full" />
				</div>
				<p className="absolute top-0 left-0 right-0 text-center items-center py-1 md:py-2 w-full h-[30px] font-light md:font-bold text-gray-100">
					Projects
				</p>
				<div className="w-[99.99%] h-[95.8%] md:w-full md:h-[94.4%] rounded-b-md mt-1 bg-white">
					<div className="flex border-b-2 pt-1 px-1">
						<Tab
							tabName="ICE Play"
							selectedTab={selectedTab}
							setSelectedTab={setSelectedTab}
						/>
						<Tab
							tabName="Plataforma ESG"
							selectedTab={selectedTab}
							setSelectedTab={setSelectedTab}
						/>
						<Tab
							tabName="Kalidash"
							selectedTab={selectedTab}
							setSelectedTab={setSelectedTab}
						/>
						<Tab
							tabName="MyVendas"
							selectedTab={selectedTab}
							setSelectedTab={setSelectedTab}
						/>
					</div>
					<div className="h-full w-full relative">
						{selectedTab === "ICE Play" && (
							<Image
								fill
								src="/iceplay/1.jpg"
								alt={"Demonstração ICE Play"}
								className="object-cover"
							/>
						)}
						{selectedTab === "Plataforma ESG" && (
							<Image
								fill
								src="/esg/1.jpg"
								alt={"Demonstração Plataforma ESG"}
								className="object-cover"
							/>
						)}
						{selectedTab === "Kalidash" && (
							<Image
								fill
								src="/kalidash/1.jpg"
								alt={"Demonstração Kalidash"}
								className="object-cover"
							/>
						)}
						{selectedTab === "MyVendas" && (
							<Image
								fill
								src="/myvendas/1.jpg"
								alt={"Demonstração MyVendas"}
								className="object-cover"
							/>
						)}
					</div>
				</div>
			</div>
		</>
	);
}

function Tab({
	tabName,
	selectedTab,
	setSelectedTab,
}: {
	tabName: string;
	selectedTab: string;
	setSelectedTab: Dispatch<SetStateAction<string>>;
}) {
	function handleProjectChange(project: string) {
		setSelectedTab(project);
	}

	return (
		<div
			className={`bg-gray-200 w-40 px-3 py-1 rounded-t-lg cursor-pointer ${
				selectedTab === tabName
					? "border-x-2 border-t-2 border-gray-700"
					: "border-x-2 border-t-2 border-gray-300"
			}`}
			onClick={() => handleProjectChange(tabName)}
		>
			<p>{tabName}</p>
		</div>
	);
}