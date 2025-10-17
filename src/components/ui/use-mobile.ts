import * as React from "react";

export function useIsMobile(breakpoint = 768) {
	const [isMobile, setIsMobile] = React.useState<boolean>(false);

	React.useEffect(() => {
		const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
		const update = (mq: MediaQueryList | MediaQueryListEvent) => {
			// Both have a 'matches' property
			setIsMobile((mq as MediaQueryList).matches ?? (mq as MediaQueryListEvent).matches);
		};
		update(mql);
		const listener = (e: MediaQueryListEvent) => update(e);
				if (typeof mql.addEventListener === "function") {
			mql.addEventListener("change", listener);
		} else {
					(mql as unknown as { addListener: (l: (e: MediaQueryListEvent) => void) => void }).addListener(listener);
		}
		return () => {
			if (typeof mql.removeEventListener === "function") {
				mql.removeEventListener("change", listener);
			} else {
						(mql as unknown as { removeListener: (l: (e: MediaQueryListEvent) => void) => void }).removeListener(listener);
			}
		};
	}, [breakpoint]);

	return isMobile;
}

