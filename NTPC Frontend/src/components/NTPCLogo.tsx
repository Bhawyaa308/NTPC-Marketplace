export function NTPCLogo({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex items-center justify-center rounded-md text-white font-bold"
        style={{ width: size, height: size, background: "linear-gradient(135deg, #003d78 0%, #0a5cad 100%)", fontSize: size * 0.4 }}
        aria-label="NTPC Logo"
      >
        NTPC
      </div>
    </div>
  );
}

export function NTPCBrand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <NTPCLogo size={compact ? 32 : 36} />
      {!compact && (
        <div className="leading-tight">
          <div className="text-[15px] font-bold text-foreground">NTPC Marketplace</div>
          <div className="text-[11px] text-muted-foreground">Built for NTPC Employees</div>
        </div>
      )}
    </div>
  );
}
