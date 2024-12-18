import { BluredBackground } from './BluredBackground'
import { HeaderContent } from './HeaderContent'
import { SearchButton } from './SearchButton'
import { AnimatedLogo } from './AnimatedLogo'
import { HeaderMeta } from './HeaderMeta'
import { HeaderDrawer } from './HeaderDrawer'
import { useIsMobile } from './hooks'
import ThemeButton from './ThemeButton'

export function Header() {
  const isMobile = useIsMobile()

  return (
    <header className="fixed top-0 inset-x-0 h-[64px] z-10 overflow-hidden">
      <BluredBackground />
      <div className="max-w-[1100px] h-full md:px-4 mx-auto grid grid-cols-[64px_auto_80px]">
        <div className="flex items-center justify-center">
          {isMobile ? <HeaderDrawer /> : <AnimatedLogo />}
        </div>
        <div className="relative flex items-center justify-center">
          {isMobile ? <AnimatedLogo /> : <HeaderContent />}
          <HeaderMeta />
        </div>
        <div className="flex items-center justify-center space-x-2 [&>*]:flex-shrink-0">
          <SearchButton />
          <ThemeButton />
        </div>
      </div>
    </header>
  )
}
