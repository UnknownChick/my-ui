import { afterEach, describe, expect, it } from "vitest";
import Sidebar from "../src/js/components/sidebar.js";

function sidebarMarkup() {
	return `
		<aside class="sidebar" id="app-sidebar">
			<div class="sidebar__header">
				<a class="sidebar__brand" href="#home">
					<span class="sidebar__logo">M</span>
					<span class="sidebar__brand-text">My UI</span>
				</a>
				<button class="sidebar__toggle" type="button" aria-label="Toggle sidebar">
					<span class="sidebar__toggle-icon"></span>
				</button>
			</div>
			<nav class="sidebar__nav">
				<div class="sidebar__group">
					<p class="sidebar__group-label">General</p>
					<ul class="sidebar__list">
						<li class="sidebar__item">
							<a class="sidebar__link sidebar__link--active" href="#home" aria-current="page">
								<span class="sidebar__icon"></span>
								<span class="sidebar__label">Dashboard</span>
							</a>
						</li>
						<li class="sidebar__item">
							<button class="sidebar__link sidebar__link--toggle" type="button">
								<span class="sidebar__icon"></span>
								<span class="sidebar__label">Projects</span>
								<span class="sidebar__arrow"></span>
							</button>
							<div class="sidebar__submenu">
								<ul class="sidebar__submenu-list">
									<li class="sidebar__submenu-item"><a class="sidebar__submenu-link" href="#alpha">Alpha</a></li>
								</ul>
							</div>
						</li>
					</ul>
				</div>
			</nav>
		</aside>`;
}

afterEach(() => {
	document.body.innerHTML = "";
	localStorage.clear();
});

describe("Sidebar", () => {
	it("collapses to an icon rail, restores labels, and removes listeners on destroy", () => {
		document.body.innerHTML = sidebarMarkup();
		const root = document.querySelector(".sidebar");
		const toggle = root.querySelector(".sidebar__toggle");
		const dashboard = root.querySelector(".sidebar__link");
		const events = [];
		root.addEventListener("sidebar:collapse", (event) =>
			events.push(event.type),
		);
		root.addEventListener("sidebar:expand", (event) => events.push(event.type));

		const sidebar = new Sidebar(root);
		expect(toggle.getAttribute("aria-expanded")).toBe("true");
		expect(dashboard.hasAttribute("title")).toBe(false);

		toggle.click();
		expect(root.classList.contains("sidebar--collapsed")).toBe(true);
		expect(toggle.getAttribute("aria-expanded")).toBe("false");
		expect(dashboard.getAttribute("title")).toBe("Dashboard");
		expect(events).toEqual(["sidebar:collapse"]);

		toggle.click();
		expect(root.classList.contains("sidebar--collapsed")).toBe(false);
		expect(toggle.getAttribute("aria-expanded")).toBe("true");
		expect(dashboard.hasAttribute("title")).toBe(false);
		expect(events).toEqual(["sidebar:collapse", "sidebar:expand"]);

		sidebar.destroy();
		expect(Sidebar.getInstance(root)).toBeUndefined();
		toggle.click();
		expect(root.classList.contains("sidebar--collapsed")).toBe(false);
		expect(events).toEqual(["sidebar:collapse", "sidebar:expand"]);
	});

	it("toggles submenus, syncs ARIA state, and keeps closed branches inert", () => {
		document.body.innerHTML = sidebarMarkup();
		const root = document.querySelector(".sidebar");
		const item = root.querySelectorAll(".sidebar__item")[1];
		const trigger = item.querySelector(".sidebar__link--toggle");
		const submenu = item.querySelector(".sidebar__submenu");
		const events = [];
		root.addEventListener("sidebar:submenu-toggle", (event) =>
			events.push(event.detail.open),
		);

		const sidebar = new Sidebar(root);
		expect(trigger.getAttribute("aria-expanded")).toBe("false");
		expect(trigger.getAttribute("aria-controls")).toBe(submenu.id);
		expect(submenu.hasAttribute("inert")).toBe(true);
		expect(item.classList.contains("sidebar__item--open")).toBe(false);

		trigger.click();
		expect(item.classList.contains("sidebar__item--open")).toBe(true);
		expect(trigger.getAttribute("aria-expanded")).toBe("true");
		expect(submenu.hasAttribute("inert")).toBe(false);
		expect(events).toEqual([true]);

		trigger.click();
		expect(item.classList.contains("sidebar__item--open")).toBe(false);
		expect(trigger.getAttribute("aria-expanded")).toBe("false");
		expect(submenu.hasAttribute("inert")).toBe(true);
		expect(events).toEqual([true, false]);

		sidebar.destroy();
	});

	it("opens the branch containing the current page and supports accordion mode", () => {
		document.body.innerHTML = `
			<aside class="sidebar">
				<nav class="sidebar__nav">
					<ul class="sidebar__list">
						<li class="sidebar__item">
							<button class="sidebar__link sidebar__link--toggle" type="button">A</button>
							<div class="sidebar__submenu"><ul class="sidebar__submenu-list"><li class="sidebar__submenu-item"><a class="sidebar__submenu-link" href="#a">A1</a></li></ul></div>
						</li>
						<li class="sidebar__item">
							<button class="sidebar__link sidebar__link--toggle" type="button">B</button>
							<div class="sidebar__submenu"><ul class="sidebar__submenu-list"><li class="sidebar__submenu-item"><a class="sidebar__submenu-link sidebar__submenu-link--active" href="#b" aria-current="page">B1</a></li></ul></div>
						</li>
					</ul>
				</nav>
			</aside>`;
		const root = document.querySelector(".sidebar");
		const [first, second] = root.querySelectorAll(".sidebar__item");
		const firstTrigger = first.querySelector(".sidebar__link--toggle");
		const secondTrigger = second.querySelector(".sidebar__link--toggle");

		const sidebar = new Sidebar(root, { accordion: true });
		expect(second.classList.contains("sidebar__item--open")).toBe(true);
		expect(secondTrigger.getAttribute("aria-expanded")).toBe("true");
		expect(first.classList.contains("sidebar__item--open")).toBe(false);

		firstTrigger.click();
		expect(first.classList.contains("sidebar__item--open")).toBe(true);
		expect(firstTrigger.getAttribute("aria-expanded")).toBe("true");
		expect(second.classList.contains("sidebar__item--open")).toBe(false);
		expect(secondTrigger.getAttribute("aria-expanded")).toBe("false");

		sidebar.destroy();
	});

	it("expands the rail before opening a branch and persists the collapsed state", () => {
		document.body.innerHTML = sidebarMarkup();
		const root = document.querySelector(".sidebar");
		const item = root.querySelectorAll(".sidebar__item")[1];
		const trigger = item.querySelector(".sidebar__link--toggle");
		const events = [];
		root.addEventListener("sidebar:expand", (event) => events.push(event.type));
		root.addEventListener("sidebar:submenu-toggle", (event) =>
			events.push(`submenu:${event.detail.open}`),
		);

		const sidebar = new Sidebar(root, {
			collapsed: true,
			storageKey: "myui-sidebar-test",
		});
		expect(root.classList.contains("sidebar--collapsed")).toBe(true);
		expect(localStorage.getItem("myui-sidebar-test")).toBe("true");

		trigger.click();
		expect(root.classList.contains("sidebar--collapsed")).toBe(false);
		expect(item.classList.contains("sidebar__item--open")).toBe(true);
		expect(events).toEqual(["sidebar:expand", "submenu:true"]);

		sidebar.collapse();
		expect(localStorage.getItem("myui-sidebar-test")).toBe("true");
		sidebar.destroy();

		const restored = new Sidebar(root, {
			storageKey: "myui-sidebar-test",
		});
		expect(root.classList.contains("sidebar--collapsed")).toBe(true);
		expect(item.classList.contains("sidebar__item--open")).toBe(false);
		restored.expand();
		expect(localStorage.getItem("myui-sidebar-test")).toBe("false");
		restored.destroy();
	});
});
