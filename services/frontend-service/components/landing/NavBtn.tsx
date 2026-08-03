const NavBtn = () => {
    return (
        <button
            className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:hover:scale-[1.03] hover:shadow-lg hover:shadow-primary/30 motion-safe:active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer"
        >
            {/* shimmer sweep */}
            <span
                aria-hidden="true"
                className="absolute inset-0 -translate-x-[150%] skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out motion-safe:group-hover:translate-x-[150%]"
            />

            <span className="relative">Start A Free Trial</span>


        </button>
    );
};

export default NavBtn;