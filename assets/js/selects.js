(function registerCustomSelects() {
	const initCustomSelects = () => {
		const wrappers = Array.from(document.querySelectorAll("[data-select]"));

		const closeAll = (except) => {
			wrappers.forEach((wrapper) => {
				if (wrapper !== except) {
					closeSelect(wrapper);
				}
			});
		};

		const buildOptions = (wrapper, nativeSelect) => {
			const list = wrapper.querySelector(".select__list");
			list.innerHTML = "";

			Array.from(nativeSelect.options).forEach((option, index) => {
				const item = document.createElement("li");
				item.className = "select__option";
				item.setAttribute("role", "option");
				item.setAttribute("tabindex", "-1");
				item.dataset.value = option.value;
				item.textContent = option.textContent;
				item.setAttribute("aria-selected", option.selected ? "true" : "false");

				item.addEventListener("click", () => {
					setSelected(wrapper, nativeSelect, option.value);
					closeSelect(wrapper);
					wrapper.querySelector(".select__trigger").focus();
				});

				item.addEventListener("mouseenter", () => {
					focusOption(list, index);
				});

				list.appendChild(item);
			});
		};

		const setSelected = (wrapper, nativeSelect, value) => {
			nativeSelect.value = value;
			const valueEl = wrapper.querySelector(".select__value");
			const selectedOption = nativeSelect.options[nativeSelect.selectedIndex];
			valueEl.textContent = selectedOption ? selectedOption.textContent : "";

			const optionEls = wrapper.querySelectorAll(".select__option");
			optionEls.forEach((optionEl) => {
				const isSelected = optionEl.dataset.value === value;
				optionEl.setAttribute("aria-selected", isSelected ? "true" : "false");
			});
		};

		const focusOption = (list, index) => {
			const options = list.querySelectorAll(".select__option");
			if (options.length === 0) {
				return;
			}
			const nextIndex = Math.max(0, Math.min(index, options.length - 1));
			options[nextIndex].focus();
		};

		const openSelect = (wrapper) => {
			const list = wrapper.querySelector(".select__list");
			const trigger = wrapper.querySelector(".select__trigger");
			list.setAttribute("aria-hidden", "false");
			trigger.setAttribute("aria-expanded", "true");
			closeAll(wrapper);

			const selectedIndex = Array.from(list.children).findIndex(
				(option) => option.getAttribute("aria-selected") === "true"
			);
			focusOption(list, selectedIndex >= 0 ? selectedIndex : 0);
		};

		const closeSelect = (wrapper) => {
			const list = wrapper.querySelector(".select__list");
			const trigger = wrapper.querySelector(".select__trigger");
			list.setAttribute("aria-hidden", "true");
			trigger.setAttribute("aria-expanded", "false");
		};

		wrappers.forEach((wrapper) => {
			const field = wrapper.closest(".field");
			const nativeSelect = field.querySelector("select");
			const trigger = wrapper.querySelector(".select__trigger");
			const list = wrapper.querySelector(".select__list");

			buildOptions(wrapper, nativeSelect);
			setSelected(wrapper, nativeSelect, nativeSelect.value);
			closeSelect(wrapper);

			trigger.addEventListener("click", () => {
				const isOpen = trigger.getAttribute("aria-expanded") === "true";
				if (isOpen) {
					closeSelect(wrapper);
				} else {
					openSelect(wrapper);
				}
			});

			trigger.addEventListener("keydown", (event) => {
				if (event.key === "ArrowDown" || event.key === "ArrowUp") {
					event.preventDefault();
					openSelect(wrapper);
				}
			});

			list.addEventListener("keydown", (event) => {
				const options = Array.from(list.querySelectorAll(".select__option"));
				const currentIndex = options.findIndex((option) => option === document.activeElement);

				if (event.key === "ArrowDown") {
					event.preventDefault();
					focusOption(list, currentIndex + 1);
				}

				if (event.key === "ArrowUp") {
					event.preventDefault();
					focusOption(list, currentIndex - 1);
				}

				if (event.key === "Home") {
					event.preventDefault();
					focusOption(list, 0);
				}

				if (event.key === "End") {
					event.preventDefault();
					focusOption(list, options.length - 1);
				}

				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					const active = document.activeElement;
					if (active && active.classList.contains("select__option")) {
						setSelected(wrapper, nativeSelect, active.dataset.value);
						closeSelect(wrapper);
						trigger.focus();
					}
				}

				if (event.key === "Escape") {
					event.preventDefault();
					closeSelect(wrapper);
					trigger.focus();
				}
			});

			document.addEventListener("click", (event) => {
				if (!wrapper.contains(event.target)) {
					closeSelect(wrapper);
				}
			});

			nativeSelect.addEventListener("change", () => {
				setSelected(wrapper, nativeSelect, nativeSelect.value);
			});
		});

		return () => {
			wrappers.forEach((wrapper) => {
				const field = wrapper.closest(".field");
				const nativeSelect = field.querySelector("select");
				buildOptions(wrapper, nativeSelect);
				setSelected(wrapper, nativeSelect, nativeSelect.value);
			});
		};
	};

	window.SockSelects = { initCustomSelects };
})();
