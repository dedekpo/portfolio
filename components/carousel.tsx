"use client";

import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback } from "react";

export default function Carousel({ images }: { images: string[] }) {
	const [emblaRef, emblaApi] = useEmblaCarousel();

	const scrollPrev = useCallback(() => {
		console.log("clicked");
		if (emblaApi) emblaApi.scrollPrev();
	}, [emblaApi]);

	const scrollNext = useCallback(() => {
		if (emblaApi) emblaApi.scrollNext();
	}, [emblaApi]);

	return (
		<div className="overflow-hidden h-full relative" ref={emblaRef}>
			<div className="flex h-full">
				{images?.map((image, index) => (
					<div
						key={index}
						className="min-w-0 flex-[0_0_100%] relative"
					>
						<Image
							fill
							src={image}
							alt={"Demonstração app"}
							className="object-contain object-top"
						/>
					</div>
				))}
			</div>
			<button
				className="absolute left-0 top-0 h-full w-9"
				onClick={scrollPrev}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.5}
					stroke="currentColor"
					className="w-6 h-6"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5"
					/>
				</svg>
			</button>
			<button
				className="absolute right-0 top-0 h-full w-9"
				onClick={scrollNext}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.5}
					stroke="currentColor"
					className="w-6 h-6"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5"
					/>
				</svg>
			</button>
		</div>
	);
}
