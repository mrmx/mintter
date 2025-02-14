import {
  Button,
  ButtonProps,
  ListItem,
  ListItemProps,
  SizableText,
  SizableTextProps,
  YStack,
} from '@mintter/ui'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import {forwardRef} from 'react'
import {DialogOverlay} from './dialog'

const Content = ({
  children,
  ...props
}: DropdownMenuPrimitive.DropdownMenuContentProps) => {
  return (
    <DropdownMenuPrimitive.Content asChild {...props}>
      <YStack
        //@ts-ignore
        contentEditable={false}
        minWidth={220}
        elevation="$5"
        backgroundColor="$background"
        borderRadius="$3"
        overflow="hidden"
        zIndex="$max"
      >
        {children}
      </YStack>
    </DropdownMenuPrimitive.Content>
  )
}

const SubContent = forwardRef<
  any,
  DropdownMenuPrimitive.DropdownMenuSubContentProps
>(({children, ...props}, ref) => {
  return (
    <DropdownMenuPrimitive.SubContent asChild {...props}>
      <YStack
        ref={ref}
        //@ts-ignore
        contentEditable={false}
        minWidth={300}
        elevation="$7"
        backgroundColor="$background"
        borderRadius="$3"
        overflow="hidden"
        zIndex="$max"
      >
        {children}
      </YStack>
    </DropdownMenuPrimitive.SubContent>
  )
})

var RightSlot = SizableText

export const ElementDropdown = forwardRef<any, ButtonProps>((props, ref) => {
  return (
    <DropdownMenuPrimitive.Trigger asChild ref={ref}>
      <Button size="$2" {...props} />
    </DropdownMenuPrimitive.Trigger>
  )
})

export const SubTrigger = forwardRef<any, SizableTextProps>((props, ref) => {
  return (
    <DropdownMenuPrimitive.SubTrigger asChild ref={ref}>
      <SizableText
        outlineStyle="none"
        backgroundColor="$background"
        paddingHorizontal="$4"
        paddingVertical="$2"
        outlineColor="transparent"
        {...props}
        // onPress={props.onSelect}
      />
    </DropdownMenuPrimitive.SubTrigger>
  )
})

function Label(props: SizableTextProps) {
  return (
    <DropdownMenuPrimitive.Label asChild>
      <SizableText
        outlineStyle="none"
        backgroundColor="$background"
        size="$1"
        paddingHorizontal="$4"
        outlineColor="transparent"
        {...props}
      />
    </DropdownMenuPrimitive.Label>
  )
}

const Item = forwardRef<
  any,
  Omit<DropdownMenuPrimitive.DropdownMenuItemProps, 'onSelect'> & {
    iconAfter?: ListItemProps['iconAfter']
    icon?: ListItemProps['icon']
    onPress: ListItemProps['onPress']
  }
>(({children, title, icon, iconAfter, disabled, ...props}, ref) => {
  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      {...props}
      disabled={disabled}
      asChild
    >
      <MenuItem
        title={title}
        icon={icon}
        iconAfter={iconAfter}
        disabled={disabled}
      >
        {children}
      </MenuItem>
    </DropdownMenuPrimitive.Item>
  )
})

export const Dropdown = {
  ...DropdownMenuPrimitive,
  // Content,
  Overlay: DialogOverlay,
  Trigger: ElementDropdown,
  Label,
  Content,
  SubContent,
  Item,

  SubTrigger,
  // Separator: StyledSeparator,
  RightSlot,
}

export function MenuItem({
  disabled,
  title,
  icon,
  iconAfter,
  children,
  ...props
}: ListItemProps) {
  return (
    <ListItem
      hoverTheme
      pressTheme
      size="$2"
      focusTheme
      paddingVertical="$2"
      paddingHorizontal="$4"
      textAlign="left"
      outlineColor="transparent"
      space="$2"
      opacity={disabled ? 0.5 : 1}
      userSelect="none"
      cursor={disabled ? 'not-allowed' : 'pointer'}
      title={
        title ? (
          <SizableText
            fontSize="$2"
            cursor={disabled ? 'not-allowed' : 'pointer'}
            userSelect="none"
          >
            {title}
          </SizableText>
        ) : undefined
      }
      icon={icon}
      iconAfter={iconAfter}
      {...props}
    >
      {children}
    </ListItem>
  )
}
