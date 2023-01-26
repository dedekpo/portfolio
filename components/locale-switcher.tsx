import Image from "next/image";
import Link from "next/link";

export default function LocaleSwitcher() {
	return (
		<div className="flex gap-1 items-center border-2">
			<Link href="/en">
				<div className="w-5 h-5 border-2">
					<Image
						fill
						src="/us.png"
						alt={"United States flag"}
						className="object-cover"
					/>
				</div>
			</Link>
			<Link href="/pt">
				<div className="w-5 h-5 border-2">
					<Image
						fill
						src="/br.png"
						alt={"Brazil flag"}
						className="object-cover"
					/>
				</div>
			</Link>
		</div>
	);
}
