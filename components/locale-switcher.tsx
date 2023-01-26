import Image from "next/image";
import Link from "next/link";

export default function LocaleSwitcher() {
	return (
		<div className="flex gap-5 items-center">
			<Link href="/en">
				<div className="w-5 h-5 relative">
					<Image
						fill
						src="/us.png"
						alt={"United States flag"}
						className="object-cover"
					/>
				</div>
			</Link>
			<Link href="/pt">
				<div className="w-5 h-5 relative">
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
