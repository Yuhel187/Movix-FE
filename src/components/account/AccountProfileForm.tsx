import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';

interface ProfileFormProps {
  email: string;
  displayName: string;
  setDisplayName: (value: string) => void;
  gender: 'male' | 'female' | 'other' | undefined;
  setGender: (value: 'male' | 'female' | 'other') => void;
  displayNameColor: string;
  setDisplayNameColor: (value: string) => void;
  isColorLocked: boolean;
  colorHelperText?: string;
}

const PRESET_COLORS = ['#22c55e', '#06b6d4', '#f59e0b', '#ef4444', '#a855f7', '#eab308'];

export function AccountProfileForm({
  email,
  displayName,
  setDisplayName,
  gender,
  setGender,
  displayNameColor,
  setDisplayNameColor,
  isColorLocked,
  colorHelperText,
}: ProfileFormProps) {
  
  return (
    <Card>
      <CardContent className="space-y-6 pt-6">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            disabled
            className="bg-zinc-800 border-zinc-700"
          />
        </div>

        {/* Tên */}
        <div className="space-y-2">
          <Label htmlFor="displayName">Tên hiển thị</Label>
          <Input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="bg-zinc-800 border-zinc-700 focus-visible:ring-yellow-500"
          />
        </div>

        {/* Màu tên hiển thị */}
        <div className="space-y-3">
          <Label htmlFor="displayNameColor">Màu tên hiển thị</Label>

          <div className="flex items-center gap-3">
            <Input
              id="displayNameColor"
              type="color"
              value={displayNameColor || '#ffffff'}
              disabled={isColorLocked}
              onChange={(e) => setDisplayNameColor(e.target.value)}
              className="h-10 w-16 cursor-pointer border-zinc-700 bg-zinc-800 p-1"
            />
            <Input
              value={displayNameColor}
              disabled={isColorLocked}
              onChange={(e) => setDisplayNameColor(e.target.value)}
              placeholder="#22c55e"
              className="bg-zinc-800 border-zinc-700 focus-visible:ring-yellow-500"
            />
            <button
              type="button"
              disabled={isColorLocked}
              onClick={() => setDisplayNameColor('')}
              className="rounded-md border border-zinc-700 px-3 py-2 text-xs text-zinc-300 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Mặc định
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                title={`Chọn màu ${color}`}
                disabled={isColorLocked}
                onClick={() => setDisplayNameColor(color)}
                className="h-7 w-7 rounded-full border border-white/20 transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          <div className="rounded-md border border-zinc-700 bg-zinc-900/60 p-3">
            <p className="text-xs text-zinc-400">Xem trước</p>
            <p className="mt-1 text-base font-semibold" style={{ color: displayNameColor }}>
              {displayName || 'Tên của bạn'}
            </p>
          </div>

          {colorHelperText && (
            <p className={`text-xs ${isColorLocked ? 'text-amber-400' : 'text-zinc-400'}`}>
              {colorHelperText}
            </p>
          )}
        </div>

        {/* Giới tính */}
        <div className="space-y-3">
          <Label>Giới tính</Label>
          <RadioGroup
            value={gender}
            onValueChange={(val) => setGender(val as 'male' | 'female' | 'other')}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" />
              <Label htmlFor="male" className="font-normal">
                Nam
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" />
              <Label htmlFor="female" className="font-normal">
                Nữ
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other" className="font-normal">
                Không xác định
              </Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}