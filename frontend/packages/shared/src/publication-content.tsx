import { Timestamp } from '@bufbuild/protobuf'
import {
  BACKEND_HTTP_URL,
  Block,
  BlockNode,
  HMBlock,
  HMBlockChildrenType,
  HMBlockCodeBlock,
  HMBlockFile,
  HMBlockNode,
  HMInlineContent,
  HMPublication,
  MttLink,
  Publication,
  formatBytes,
  formattedDate,
  getCIDFromIPFSUrl,
  idToUrl,
  isHypermediaScheme,
  toHMInlineContent,
  unpackHmId,
  useHover,
} from '@mintter/shared'
import {
  Button,
  ButtonFrame,
  Check as CheckIcon,
  Checkbox,
  CheckboxProps,
  ColorProp,
  Copy,
  File,
  Label,
  RadioGroup,
  SizableText,
  SizableTextProps,
  SizeTokens,
  Text,
  TextProps,
  Tooltip,
  UIAvatar,
  XStack,
  XStackProps,
  YStack,
  YStackProps,
} from '@mintter/ui'
import { AlertCircle, Book } from '@tamagui/lucide-icons'
import { nip19, nip21, validateEvent, verifySignature } from 'nostr-tools'
import {
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react'
import { RiCheckFill, RiCloseCircleLine, RiRefreshLine } from 'react-icons/ri'
import { HMAccount, HMGroup } from './json-hm'
import {
  contentLayoutUnit,
  contentTextUnit,
} from './publication-content-constants'
import './publication-content.css'

export type EntityComponentsRecord = {
  AccountCard: React.FC<EntityComponentProps>
  GroupCard: React.FC<EntityComponentProps>
  PublicationCard: React.FC<EntityComponentProps>
  PublicationContent: React.FC<EntityComponentProps>
}

export type PublicationContentContextValue = {
  entityComponents: EntityComponentsRecord
  onLinkClick: (dest: string, e: any) => void
  ipfsBlobPrefix: string
  saveCidAsFile: (cid: string, name: string) => Promise<void>
  citations?: Array<MttLink>
  onCitationClick?: () => void
  disableEmbedClick?: boolean
  onCopyBlock: null | ((blockId: string) => void)
  layoutUnit: number
  textUnit: number
  debug: boolean
  ffSerif?: boolean
}

export const publicationContentContext =
  createContext<PublicationContentContextValue | null>(null)

export type EntityComponentProps = BlockContentProps &
  ReturnType<typeof unpackHmId>

export function PublicationContentProvider({
  children,
  debugTop = 0,
  showDevMenu = false,
  ...PubContentContext
}: PropsWithChildren<
  PublicationContentContextValue & {
    debugTop?: number
    showDevMenu?: boolean
    ffSerif?: boolean
  }
>) {
  const [tUnit, setTUnit] = useState(contentTextUnit)
  const [lUnit, setLUnit] = useState(contentLayoutUnit)
  const [debug, setDebug] = useState(false)
  const [ffSerif, toggleSerif] = useState(true)
  return (
    <publicationContentContext.Provider
      value={{
        ...PubContentContext,
        layoutUnit: lUnit,
        textUnit: tUnit,
        debug,
        ffSerif,
      }}
    >
      {showDevMenu ? (
        <YStack
          zIndex={100}
          padding="$2"
          // @ts-ignore
          position="fixed"
          borderColor="$color7"
          borderWidth={1}
          bottom={16}
          right={16}
          backgroundColor="$backgroundHover"
        >
          <CheckboxWithLabel
            label="debug"
            checked={debug}
            // @ts-ignore
            onCheckedChange={setDebug}
            size="$1"
          />
          <CheckboxWithLabel
            label="body sans-serif"
            checked={ffSerif}
            // @ts-ignore
            onCheckedChange={toggleSerif}
            size="$1"
          />
          <RadioGroup
            aria-labelledby="text unit"
            defaultValue="18"
            name="form"
            onValueChange={(val) => setTUnit(Number(val))}
          >
            <XStack gap="$2">
              <SizableText size="$1">Text unit:</SizableText>
              <RadioGroupItemWithLabel value="14" label="14" />
              <RadioGroupItemWithLabel value="16" label="16" />
              <RadioGroupItemWithLabel value="18" label="18" />
              <RadioGroupItemWithLabel value="20" label="20" />
              <RadioGroupItemWithLabel value="24" label="24" />
            </XStack>
          </RadioGroup>
          <RadioGroup
            aria-labelledby="layout unit"
            defaultValue="24"
            name="form"
            onValueChange={(val) => setLUnit(Number(val))}
          >
            <XStack gap="$2">
              <SizableText size="$1">Layout unit:</SizableText>
              <RadioGroupItemWithLabel value="16" label="16" />
              <RadioGroupItemWithLabel value="20" label="20" />
              <RadioGroupItemWithLabel value="24" label="24" />
              <RadioGroupItemWithLabel value="28" label="28" />
              <RadioGroupItemWithLabel value="32" label="32" />
            </XStack>
          </RadioGroup>
        </YStack>
      ) : null}
      {children}
    </publicationContentContext.Provider>
  )
}

export function usePublicationContentContext() {
  let context = useContext(publicationContentContext)

  if (!context) {
    throw new Error(
      `Please wrap <PublicationContent /> with <PublicationContentProvider />`,
    )
  }

  return context
}

function debugStyles(debug: boolean = false, color: ColorProp = '$color7') {
  return debug
    ? {
        borderWidth: 1,
        borderColor: color,
      }
    : {}
}

export function PublicationContent({
  publication,
  ...props
}: XStackProps & {
  publication: Publication | HMPublication
}) {
  const {layoutUnit} = usePublicationContentContext()
  const allBlocks = publication.document?.children || []
  const hideTopBlock = // to avoid thrashing existing content, we hide the top block if it is effectively the same as the doc title
    !!publication.document?.title &&
    allBlocks[0]?.block?.type == 'heading' &&
    (!allBlocks[0]?.children || allBlocks[0]?.children?.length == 0) &&
    allBlocks[0]?.block?.text &&
    allBlocks[0]?.block?.text === publication.document?.title
  const displayBlocks = hideTopBlock ? allBlocks.slice(1) : allBlocks
  return (
    <YStack
      paddingHorizontal={layoutUnit / 2}
      $gtMd={{paddingHorizontal: layoutUnit}}
      {...props}
    >
      <BlockNodeList childrenType={'group'}>
        {displayBlocks?.length &&
          displayBlocks?.map((bn, idx) => (
            <BlockNodeContent
              key={bn.block?.id}
              blockNode={bn}
              depth={1}
              childrenType="group"
              index={idx}
            />
          ))}
      </BlockNodeList>
    </YStack>
  )
}

export function BlockNodeList({
  children,
  childrenType = 'group',
  start,
  ...props
}: YStackProps & {
  childrenType?: HMBlockChildrenType
  start?: any
}) {
  return (
    <YStack className="blocknode-list" {...props} width="100%">
      {children}
    </YStack>
  )
}

function BlockNodeMarker({
  block,
  childrenType,
  index = 0,
  start = '1',
}: {
  block: Block
  childrenType?: string
  start?: string
  index?: number
  headingTextStyles: TextProps
}) {
  const {layoutUnit, textUnit, debug} = usePublicationContentContext()
  let styles = useMemo(
    () =>
      childrenType == 'ol'
        ? ({
            position: 'absolute',
            right: layoutUnit / 4,
            marginTop: layoutUnit / 7,
            fontSize: textUnit * 0.7,
          } satisfies SizableTextProps)
        : {},
    [childrenType, textUnit, layoutUnit],
  )
  let marker

  if (childrenType == 'ol') {
    marker = `${index + Number(start)}.`
  }

  if (childrenType == 'ul') {
    marker = '•'
  }

  if (!marker) return null

  return (
    <XStack
      flex={0}
      width={layoutUnit}
      height={textUnit * 1.5}
      alignItems="center"
      justifyContent="flex-start"
      {...debugStyles(debug, 'green')}
    >
      <Text {...styles} fontFamily="$body" userSelect="none" opacity={0.7}>
        {marker}
      </Text>
    </XStack>
  )
}

export function BlockNodeContent({
  blockNode,
  depth = 1,
  childrenType = 'group',
  ...props
}: {
  blockNode: BlockNode | HMBlockNode
  index: number
  depth?: number
  start?: string | number
  childrenType?: HMBlockChildrenType | string
  embedDepth?: number
}) {
  const {layoutUnit} = usePublicationContentContext()
  const headingMarginStyles = useHeadingMarginStyles(depth, layoutUnit)
  const {hover, ...hoverProps} = useHover()
  const {citations} = useBlockCitations(blockNode.block?.id)

  const {onCitationClick, onCopyBlock, debug} = usePublicationContentContext()

  let bnChildren = blockNode.children?.length
    ? blockNode.children.map((bn, index) => (
        <BlockNodeContent
          key={bn.block!.id}
          depth={depth + 1}
          blockNode={bn}
          childrenType={blockNode.block!.attributes?.childrenType}
          start={blockNode.block?.attributes?.start}
          index={index}
          embedDepth={
            props.embedDepth ? props.embedDepth + 1 : props.embedDepth
          }
        />
      ))
    : null

  const headingStyles = useMemo(() => {
    if (blockNode.block?.type == 'heading') {
      return headingMarginStyles
    }

    return {}
  }, [blockNode.block, headingMarginStyles])

  const isEmbed = blockNode.block?.type == 'embed'
  return (
    <YStack
      className="blocknode-content"
      id={blockNode.block?.id}
      borderRadius={layoutUnit / 4}
      onHoverIn={() => (props.embedDepth ? undefined : hoverProps.onHoverIn())}
      onHoverOut={() =>
        props.embedDepth ? undefined : hoverProps.onHoverOut()
      }
    >
      <XStack
        padding={isEmbed ? 0 : layoutUnit / 3}
        alignItems="baseline"
        {...headingStyles}
        {...debugStyles(debug, 'red')}
      >
        <BlockNodeMarker
          block={blockNode.block!}
          childrenType={childrenType}
          index={props.index}
          start={props.start}
        />
        <BlockContent block={blockNode.block!} depth={depth} />
        {!props.embedDepth ? (
          <XStack
            position="absolute"
            top={layoutUnit / 4}
            right={0}
            backgroundColor={hover ? '$background' : 'transparent'}
            borderRadius={layoutUnit / 4}
            // flexDirection="row-reverse"
            $gtMd={
              {
                // disabled because it intersects with the sidebar at narrow screen widths:
                // right: isEmbed ? layoutUnit * -1.5 : layoutUnit * -1.5,
              }
            }
          >
            {citations?.length ? (
              <Button
                size="$1"
                padding="$2"
                borderRadius="$2"
                chromeless
                onPress={() => onCitationClick?.()}
              >
                <SizableText color="$blue11" size="$1">
                  {citations.length}
                </SizableText>
              </Button>
            ) : null}

            {onCopyBlock ? (
              <Tooltip content="Copy block reference" delay={800}>
                <Button
                  size="$2"
                  opacity={hover ? 1 : 0}
                  padding={layoutUnit / 4}
                  borderRadius={layoutUnit / 4}
                  chromeless
                  icon={Copy}
                  onPress={() => {
                    if (blockNode.block?.id) {
                      onCopyBlock(blockNode.block.id)
                    } else {
                      console.error('onCopyBlock Error: no blockId available')
                    }
                  }}
                />
              </Tooltip>
            ) : null}
          </XStack>
        ) : null}
      </XStack>
      {bnChildren ? (
        <BlockNodeList
          paddingLeft={layoutUnit}
          onHoverIn={() =>
            props.embedDepth ? undefined : hoverProps.onHoverIn()
          }
          onHoverOut={() =>
            props.embedDepth ? undefined : hoverProps.onHoverOut()
          }
          childrenType={childrenType as HMBlockChildrenType}
          start={props.start}
          display="block"
        >
          {bnChildren}
        </BlockNodeList>
      ) : null}
    </YStack>
  )
}

export const blockStyles: YStackProps = {
  width: '100%',
  alignSelf: 'center',
  flex: 1,
}

function inlineContentSize(unit: number): TextProps {
  return {
    fontSize: unit,
    lineHeight: unit * 1.3,
    $gtMd: {
      fontSize: unit * 1.1,
    },
    $gtLg: {
      fontSize: unit * 1.2,
    },
  }
}

export type BlockContentProps = {
  block: Block | HMBlock
  depth: number
}

function BlockContent(props: BlockContentProps) {
  if (props.block.type == 'paragraph') {
    return <BlockContentParagraph {...props} depth={props.depth || 1} />
  }

  if (props.block.type == 'heading') {
    return <BlockContentHeading {...props} depth={props.depth || 1} />
  }

  if (props.block.type == 'image') {
    return <BlockContentImage {...props} depth={props.depth || 1} />
  }

  if (props.block.type == 'video') {
    return <BlockContentVideo {...props} depth={props.depth} />
  }

  if (props.block.type == 'file') {
    if (props.block.attributes.subType?.startsWith('nostr:')) {
      return <BlockContentNostr block={props.block} />
    } else {
      return <BlockContentFile block={props.block} />
    }
  }

  if (props.block.type == 'embed') {
    return <BlockContentEmbed {...props} depth={props.depth} />
  }

  if (props.block.type == 'codeBlock') {
    return <BlockContentCode block={props.block} />
  }

  return <BlockContentUnknown {...props} />
}

function BlockContentParagraph({block, depth}: BlockContentProps) {
  const {debug, textUnit, ffSerif} = usePublicationContentContext()
  let inline = useMemo(() => toHMInlineContent(new Block(block)), [block])

  return (
    <YStack
      {...blockStyles}
      {...debugStyles(debug, 'blue')}
      className="block-static block-paragraph"
    >
      <Text
        className="content-inline"
        // fontFamily={ffSerif ? '$editorBody' : '$body'}
        {...inlineContentSize(textUnit)}
      >
        <InlineContentView inline={inline} />
      </Text>
    </YStack>
  )
}

export function BlockContentHeading({block, depth}: BlockContentProps) {
  const {textUnit, debug, ffSerif} = usePublicationContentContext()
  let inline = useMemo(() => toHMInlineContent(new Block(block)), [block])
  let headingTextStyles = useHeadingTextStyles(depth, textUnit)
  let tag = `h${depth}`

  return (
    <YStack
      {...blockStyles}
      {...debugStyles(debug, 'blue')}
      className="block-content block-heading"
    >
      <Text
        className="content-inline"
        // fontFamily={ffSerif ? '$editorBody' : '$body'}
        tag={tag}
        {...headingTextStyles}
        maxWidth="95%"
      >
        <InlineContentView
          inline={inline}
          fontWeight="bold"
          fontFamily="$heading"
          {...headingTextStyles}
        />
      </Text>
    </YStack>
  )
}

export function PublicationHeading({
  children,
  right,
}: {
  children?: string
  right?: React.ReactNode
}) {
  const {textUnit, debug, layoutUnit} = usePublicationContentContext()
  let headingTextStyles = useHeadingTextStyles(1, textUnit)
  let headingMarginStyles = useHeadingMarginStyles(1, layoutUnit)

  return (
    <YStack
      paddingHorizontal={layoutUnit / 2}
      $gtMd={{paddingHorizontal: layoutUnit}}
      group="header"
    >
      <YStack
        padding={layoutUnit / 3}
        marginBottom={layoutUnit}
        paddingBottom={layoutUnit / 2}
        borderBottomColor="$color6"
        borderBottomWidth={1}
        {...headingMarginStyles}
      >
        <XStack>
          <YStack {...blockStyles} {...debugStyles(debug, 'blue')}>
            <Text
              className="content-inline"
              fontFamily={'$body'}
              tag="h1"
              {...headingTextStyles}
              maxWidth="95%"
            >
              {children || 'Untitled document'}
            </Text>
          </YStack>
          {right}
        </XStack>
      </YStack>
    </YStack>
  )
}

export function useHeadingTextStyles(depth: number, unit: number) {
  function headingFontValues(value: number) {
    return {
      fontSize: value,
      lineHeight: value * 1.2,
    }
  }

  return useMemo(() => {
    if (depth == 1) {
      return {
        ...headingFontValues(unit * 1.6),
        $gtMd: headingFontValues(unit * 1.7),
        $gtLg: headingFontValues(unit * 1.8),
      } satisfies TextProps
    }

    if (depth == 2) {
      return {
        ...headingFontValues(unit * 1.4),
        $gtMd: headingFontValues(unit * 1.5),
        $gtLg: headingFontValues(unit * 1.6),
      } satisfies TextProps
    }

    if (depth == 3) {
      return {
        ...headingFontValues(unit * 1.2),
        $gtMd: headingFontValues(unit * 1.3),
        $gtLg: headingFontValues(unit * 1.4),
      } satisfies TextProps
    }

    return {
      ...headingFontValues(unit),
      $gtMd: headingFontValues(unit * 1.1),
      $gtLg: headingFontValues(unit * 1.2),
    } satisfies TextProps
  }, [depth, unit])
}

export function useHeadingMarginStyles(depth: number, unit: number) {
  function headingFontValues(value: number) {
    return {
      marginTop: value,
    }
  }

  return useMemo(() => {
    if (depth == 1) {
      return {
        ...headingFontValues(unit * 1.3),
        $gtMd: headingFontValues(unit * 1.4),
        $gtLg: headingFontValues(unit * 1.5),
      } satisfies TextProps
    }

    if (depth == 2) {
      return {
        ...headingFontValues(unit * 1.2),
        $gtMd: headingFontValues(unit * 1.25),
        $gtLg: headingFontValues(unit * 1.3),
      } satisfies TextProps
    }

    if (depth == 3) {
      return {
        ...headingFontValues(unit * 1),
        $gtMd: headingFontValues(unit * 1.15),
        $gtLg: headingFontValues(unit * 1.2),
      } satisfies TextProps
    }

    return {
      ...headingFontValues(unit),
      $gtMd: headingFontValues(unit),
      $gtLg: headingFontValues(unit),
    } satisfies TextProps
  }, [depth, unit])
}

function BlockContentImage({block, depth}: BlockContentProps) {
  let inline = useMemo(() => toHMInlineContent(new Block(block)), [block])
  const cid = getCIDFromIPFSUrl(block?.ref)
  const {ipfsBlobPrefix, textUnit} = usePublicationContentContext()
  if (!cid) return null

  return (
    <YStack
      {...blockStyles}
      className="block-static block-image"
      paddingVertical="$3"
      gap="$2"
    >
      <img alt={block.attributes.alt} src={`${ipfsBlobPrefix}${cid}`} />
      {inline.length ? (
        <Text opacity={0.7} fontFamily="$body">
          <InlineContentView inline={inline} fontSize={textUnit * 0.85} />
        </Text>
      ) : null}
    </YStack>
  )
}

function BlockContentVideo({block, depth}: BlockContentProps) {
  let inline = useMemo(() => toHMInlineContent(new Block(block)), [])
  const ref = block.ref || ''
  const {ipfsBlobPrefix, textUnit} = usePublicationContentContext()

  return (
    <YStack
      {...blockStyles}
      className="block-static block-video"
      paddingVertical="$3"
      gap="$2"
      paddingBottom="56.25%"
      position="relative"
      height={0}
    >
      {ref ? (
        ref.startsWith('ipfs://') ? (
          <XStack
            tag="video"
            top={0}
            left={0}
            position="absolute"
            width="100%"
            height="100%"
            // @ts-expect-error
            contentEditable={false}
            playsInline
            controls
            preload="metadata"
          >
            <source
              src={`${ipfsBlobPrefix}${getCIDFromIPFSUrl(block.ref)}`}
              type={getSourceType(block.attributes.name)}
            />
            <SizableText>Something is wrong with the video file.</SizableText>
          </XStack>
        ) : (
          <XStack
            tag="iframe"
            top={0}
            left={0}
            position="absolute"
            width="100%"
            height="100%"
            // @ts-expect-error
            src={block.ref}
            frameBorder="0"
            allowFullScreen
          />
        )
      ) : (
        <Text>Video block wrong state</Text>
      )}
      {inline.length ? (
        <Text opacity={0.7}>
          <InlineContentView fontSize={textUnit * 0.85} inline={inline} />
        </Text>
      ) : null}
    </YStack>
  )
}

type LinkType = null | 'basic' | 'hypermedia'

function hmTextColor(linkType: LinkType): string {
  if (linkType === 'basic') return '$color11'
  if (linkType === 'hypermedia') return '$mint11'
  return '$color12'
}

function InlineContentView({
  inline,
  style,
  linkType = null,
  fontSize,
  ...props
}: SizableTextProps & {
  inline: HMInlineContent[]
  linkType?: LinkType
  fontSize?: number
}) {
  const {onLinkClick, textUnit} = usePublicationContentContext()

  const fSize = fontSize || textUnit
  return (
    <Text fontSize={fSize} lineHeight={fSize * 1.5} {...props}>
      {inline.map((content, index) => {
        if (content.type === 'text') {
          let textDecorationLine:
            | 'none'
            | 'line-through'
            | 'underline'
            | 'underline line-through'
            | undefined
          const underline = linkType || content.styles.underline
          if (underline) {
            if (content.styles.strike) {
              textDecorationLine = 'underline line-through'
            } else {
              textDecorationLine = 'underline'
            }
          } else if (content.styles.strike) {
            textDecorationLine = 'line-through'
          }

          // TODO: fix this hack to render soft-line breaks
          let children: any = content.text.split('\n')

          if (children.length > 1) {
            children = children.map(
              (l: string, i: number, a: Array<string>) => {
                if (a.length == i - 1) {
                  return l
                } else {
                  return (
                    <>
                      {l}
                      <br />
                    </>
                  )
                }
              },
            )
          } else {
            children = content.text
          }

          if (content.styles.bold) {
            children = (
              <Text fontWeight="bold" fontSize={fSize} lineHeight={fSize * 1.5}>
                {children}
              </Text>
            )
          }

          if (content.styles.italic) {
            children = (
              <Text
                fontStyle="italic"
                fontSize={fSize}
                lineHeight={fSize * 1.5}
              >
                {children}
              </Text>
            )
          }

          if (content.styles.code) {
            children = (
              <Text
                backgroundColor="$color4"
                fontFamily="$mono"
                tag="code"
                borderRadius="$2"
                overflow="hidden"
                fontSize={fSize * 0.85}
                lineHeight={fSize * 1.5}
                paddingHorizontal="$2"
                paddingVertical={2}
              >
                {children}
              </Text>
            )
          }

          // does anything use this?
          // if (content.styles.backgroundColor) {
          //   children = (
          //     <span style={{backgroundColor: content.styles.backgroundColor}}>
          //       {children}
          //     </span>
          //   )
          // }

          // if (content.styles.strike) {
          //   children = <s>{children}</s>
          // }

          // does anything use this?
          // if (content.styles.textColor) {
          //   children = (
          //     <span style={{color: content.styles.textColor}}>{children}</span>
          //   )
          // }

          return (
            <Text
              key={index}
              color={hmTextColor(linkType)}
              textDecorationColor={hmTextColor(linkType)}
              style={{textDecorationLine}}
              fontSize={fSize}
              lineHeight={fSize * 1.5}
            >
              {children}
            </Text>
          )
        }
        if (content.type === 'link') {
          const href = isHypermediaScheme(content.href)
            ? idToUrl(content.href, null)
            : content.href
          if (!href) return null
          const isHmLink = isHypermediaScheme(content.href)
          return (
            <a
              href={href}
              className={isHmLink ? 'hm-link' : 'link'}
              key={index}
              target={isHmLink ? undefined : '_blank'}
              onClick={(e) => onLinkClick(content.href, e)}
            >
              <InlineContentView
                fontSize={fSize}
                lineHeight={fSize * 1.5}
                inline={content.content}
                linkType={isHmLink ? 'hypermedia' : 'basic'}
              />
            </a>
          )
        }
        return null
      })}
    </Text>
  )
}

export function BlockContentEmbed(props: BlockContentProps) {
  const EmbedTypes = usePublicationContentContext().entityComponents
  if (props.block.type !== 'embed')
    throw new Error('BlockContentEmbed requires an embed block type')
  const id = unpackHmId(props.block.ref)
  if (id?.type == 'a') {
    return <EmbedTypes.AccountCard {...props} {...id} />
  }
  if (id?.type == 'g') {
    return <EmbedTypes.GroupCard {...props} {...id} />
  }
  if (id?.type == 'd') {
    switch (props.block.attributes?.view || 'content') {
      case 'card':
        return <EmbedTypes.PublicationCard {...props} {...id} />
      default:
        return <EmbedTypes.PublicationContent {...props} {...id} />
    }
  }
  return <BlockContentUnknown {...props} />
}

export function EmbedContentGroup({group}: {group: HMGroup}) {
  return (
    <XStack gap="$3" padding="$2" alignItems="flex-start">
      <XStack paddingVertical="$3">
        <Book size={36} />
      </XStack>
      <YStack justifyContent="center" flex={1}>
        <Text fontSize="$1" opacity={0.5} flex={0}>
          Group
        </Text>
        <YStack gap="$2">
          <Text fontSize="$6" fontWeight="bold">
            {group?.title}
          </Text>
          <Text fontSize="$2">{group?.description}</Text>
        </YStack>
      </YStack>
    </XStack>
  )
}

export function EmbedContentAccount({account}: {account: HMAccount}) {
  const {ipfsBlobPrefix} = usePublicationContentContext()
  return (
    <XStack gap="$3" padding="$4" alignItems="flex-start">
      <XStack paddingVertical="$3">
        <UIAvatar
          id={account.id}
          size={36}
          label={account.profile?.alias}
          url={`${ipfsBlobPrefix}${account.profile?.avatar}`}
        />
      </XStack>
      <YStack justifyContent="center" flex={1}>
        <SizableText size="$1" opacity={0.5} flex={0}>
          Account
        </SizableText>
        <YStack gap="$2">
          <SizableText size="$6" fontWeight="bold">
            {account?.profile?.alias}
          </SizableText>
          <SizableText size="$2">{account.profile?.bio}</SizableText>
        </YStack>
      </YStack>
    </XStack>
  )
}

export function ErrorBlock({
  message,
  debugData,
}: {
  message: string
  debugData?: any
}) {
  let [open, toggleOpen] = useState(false)
  return (
    <Tooltip
      content={debugData ? (open ? 'Hide debug Data' : 'Show debug data') : ''}
    >
      <YStack>
        <ButtonFrame theme="red" gap="$2" onPress={() => toggleOpen((v) => !v)}>
          <SizableText flex={1} color="$red10">
            Error
          </SizableText>
          <AlertCircle color="$red10" size={12} />
        </ButtonFrame>
        {open ? (
          <XStack
            padding="$2"
            borderRadius="$3"
            margin="$2"
            backgroundColor="$backgroundHover"
          >
            <Text tag="pre" wordWrap="break-word" width="100%" fontSize={12}>
              <Text
                tag="code"
                fontSize={12}
                backgroundColor="transparent"
                fontFamily="$mono"
              >
                {JSON.stringify(debugData, null, 4)}
              </Text>
            </Text>
          </XStack>
        ) : null}
      </YStack>
    </Tooltip>
  )
}

export function BlockContentUnknown(props: BlockContentProps) {
  let message = 'Unrecognized Block'
  if (props.block.type == 'embed') {
    message = `Unrecognized Embed: ${props.block.ref}`
  }
  return <ErrorBlock message={message} debugData={props.block} />
}

export function getBlockNodeById(
  blocks: Array<BlockNode>,
  blockId: string,
): BlockNode | null {
  if (!blockId) return null

  let res: BlockNode | undefined
  blocks.find((bn) => {
    if (bn.block?.id == blockId) {
      res = bn
      return true
    } else if (bn.children?.length) {
      const foundChild = getBlockNodeById(bn.children, blockId)
      if (foundChild) {
        res = foundChild
        return true
      }
    }
    return false
  })
  return res || null
}

export function BlockContentFile({block}: {block: HMBlockFile}) {
  const {hover, ...hoverProps} = useHover()
  const {layoutUnit, saveCidAsFile} = usePublicationContentContext()
  return (
    <YStack
      // backgroundColor="$color3"
      borderColor="$color6"
      {...hoverProps}
      borderWidth={1}
      borderRadius={layoutUnit / 4}
      padding={layoutUnit / 2}
      overflow="hidden"
      width="100%"
      hoverStyle={{
        backgroundColor: '$backgroundHover',
      }}
    >
      <XStack
        borderWidth={0}
        outlineWidth={0}
        alignItems="center"
        space
        flex={1}
        width="100%"
      >
        <File size={18} />

        <SizableText
          size="$5"
          // maxWidth="17em"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
          userSelect="text"
          flex={1}
        >
          {block.attributes.name}
        </SizableText>
        {block.attributes.size && (
          <SizableText paddingTop="$1" color="$color10" size="$2">
            {formatBytes(parseInt(block.attributes.size))}
          </SizableText>
        )}

        <Tooltip content={`Download ${block.attributes.name}`}>
          <Button
            position="absolute"
            right={0}
            opacity={hover ? 1 : 0}
            size="$2"
            onPress={() => {
              saveCidAsFile(getCIDFromIPFSUrl(block.ref), block.attributes.name)
            }}
          >
            Download
          </Button>
        </Tooltip>
      </XStack>
    </YStack>
  )
}

export function BlockContentNostr({block}: {block: HMBlockFile}) {
  const {layoutUnit} = usePublicationContentContext()
  const name = block.attributes.name ?? ''
  const nostrNpud = nip19.npubEncode(name) ?? ''

  const [verified, setVerified] = useState<boolean>()
  const [content, setContent] = useState<string>()

  const uri = `nostr:${nostrNpud}`
  const header = `${nostrNpud.slice(0, 6)}...${nostrNpud.slice(-6)}`

  if (
    block.ref &&
    block.ref !== '' &&
    (content === undefined || verified === undefined)
  ) {
    const cid = getCIDFromIPFSUrl(block.ref)
    fetch(`${BACKEND_HTTP_URL}/ipfs/${cid}`, {
      method: 'GET',
    }).then((response) => {
      if (response) {
        response.text().then((text) => {
          if (text) {
            const fileEvent = JSON.parse(text)
            if (content === undefined) setContent(fileEvent.content)
            if (verified === undefined && validateEvent(fileEvent)) {
              setVerified(verifySignature(fileEvent))
            }
          }
        })
      }
    })
  }

  return (
    <YStack
      // backgroundColor="$color3"
      borderColor="$color6"
      borderWidth={1}
      borderRadius={layoutUnit / 4}
      padding={layoutUnit / 2}
      overflow="hidden"
      width="100%"
      hoverStyle={{
        backgroundColor: '$backgroundHover',
      }}
    >
      <XStack justifyContent="space-between">
        <SizableText
          size="$5"
          maxWidth="17em"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
          userSelect="text"
          flex={1}
        >
          {'Public Key: '}
          {nip21.test(uri) ? <a href={uri}>{header}</a> : {header}}
        </SizableText>
        <Tooltip
          content={
            verified === undefined
              ? ''
              : verified
              ? 'Signature verified'
              : 'Invalid signature'
          }
        >
          <Button
            size="$2"
            disabled
            theme={
              verified === undefined ? 'blue' : verified ? 'green' : 'orange'
            }
            icon={
              verified === undefined
                ? RiRefreshLine
                : verified
                ? RiCheckFill
                : RiCloseCircleLine
            }
          />
        </Tooltip>
      </XStack>
      <XStack justifyContent="space-between">
        <Text size="$6" fontWeight="bold">
          {content}
        </Text>
      </XStack>
    </YStack>
  )
}

export function BlockContentCode({block}: {block: HMBlockCodeBlock}) {
  const {layoutUnit, debug, textUnit} = usePublicationContentContext()

  return (
    <YStack
      {...blockStyles}
      borderColor="$color6"
      backgroundColor="$color4"
      borderWidth={1}
      borderRadius={layoutUnit / 4}
      padding={layoutUnit / 2}
      overflow="hidden"
      width="100%"
      {...debugStyles(debug, 'blue')}
      marginHorizontal={(-1 * layoutUnit) / 2}
    >
      <pre>
        <Text
          tag="code"
          whiteSpace="pre-wrap"
          fontFamily="$mono"
          lineHeight={textUnit * 1.5}
          fontSize={textUnit * 0.85}
        >
          {block.text}
        </Text>
      </pre>
    </YStack>
  )
}

function getSourceType(name?: string) {
  if (!name) return
  const nameArray = name.split('.')
  return `video/${nameArray[nameArray.length - 1]}`
}

export function useBlockCitations(blockId?: string) {
  const context = usePublicationContentContext()
  let citations = useMemo(() => {
    if (!context.citations?.length) return []
    return context.citations.filter((link) => {
      return link.target?.blockId == blockId
    })
  }, [blockId, context.citations])

  return {
    citations,
  }
}

function CheckboxWithLabel({
  size,
  label,
  ...checkboxProps
}: CheckboxProps & {size: SizeTokens; label: string}) {
  const id = `checkbox-${size.toString().slice(1)}`
  return (
    <XStack alignItems="center" space="$2">
      <Checkbox id={id} size={size} {...checkboxProps}>
        <Checkbox.Indicator>
          <CheckIcon />
        </Checkbox.Indicator>
      </Checkbox>

      <Label size={size} htmlFor={id}>
        {label}
      </Label>
    </XStack>
  )
}

function RadioGroupItemWithLabel(props: {value: string; label: string}) {
  const id = `radiogroup-${props.value}`
  return (
    <XStack alignItems="center" space="$2">
      <RadioGroup.Item value={props.value} id={id} size="$1">
        <RadioGroup.Indicator />
      </RadioGroup.Item>

      <Label size="$1" htmlFor={id}>
        {props.label}
      </Label>
    </XStack>
  )
}

export function PublicationCardView({
  title,
  textContent,
  editors,
  AvatarComponent,
  date,
}: {
  title?: string
  textContent?: string
  editors?: Array<string>
  AvatarComponent: React.FC<{accountId?: string}>
  date?: Timestamp
}) {
  return (
    <XStack padding="$2">
      <YStack flex={1} gap="$2">
        <SizableText
          size="$7"
          fontWeight="bold"
          textAlign="left"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
          overflow="hidden"
        >
          {title}
        </SizableText>
        {/* the maxHeight here is defined by the lineHeight of the content,
        so if we change the size of the text we need to change the maxHeight too */}
        <YStack overflow="hidden" maxHeight={20 * 3}>
          <SizableText>{textContent}</SizableText>
        </YStack>
        <XStack gap="$3" ai="center">
          <EditorsAvatars editors={editors} AvatarComponent={AvatarComponent} />
          {date ? (
            <SizableText size="$1">{formattedDate(date)}</SizableText>
          ) : null}
        </XStack>
      </YStack>
    </XStack>
  )
}

function EditorsAvatars({
  editors,
  AvatarComponent,
}: {
  editors?: Array<string>
  AvatarComponent: React.FC<{accountId?: string}>
}) {
  return (
    <XStack marginLeft={6}>
      {editors?.map((editor, idx) => (
        <XStack
          zIndex={idx + 1}
          key={editor}
          borderColor="$color4"
          backgroundColor="$color4"
          borderWidth={2}
          borderRadius={100}
          marginLeft={-8}
          animation="fast"
        >
          <AvatarComponent accountId={editor} />
        </XStack>
      ))}
    </XStack>
  )
}
