import React from "react"
import { Link } from "react-router-dom"
import styled from "styled-components"
import { ReactComponent as CheckmarkSmallSvg } from "./assets/svg/checkmark-small.svg"
import { ReactComponent as CloseSvg } from "./assets/svg/close.svg"
import { ReactComponent as NotAllowedSvg } from "./assets/svg/not-allowed.svg"
import { ReactComponent as PendingSvg } from "./assets/svg/pending.svg"
import { ReactComponent as WarningSvg } from "./assets/svg/warning.svg"
import { Hold } from "./Hold"
import { usePathBuilder } from "./PathBuilder"
import { PendingBuildDescription } from "./status"
import { Color, FontSize, Glow, SizeUnit, spin } from "./style-helpers"
import { formatBuildDuration } from "./time"
import Tooltip from "./Tooltip"
import { ResourceStatus } from "./types"

const StatusMsg = styled.span`
  text-overflow: ellipsis;
  overflow: hidden;
`
const StyledOverviewTableStatus = styled(Link)`
  color: inherit;
  text-decoration: none;
  display: flex;
  align-items: center;
  font-size: ${FontSize.small};
  line-height: ${FontSize.small};
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  width: 100%;

  &:hover {
    text-decoration: underline;
  }

  & + & {
    margin-top: -8px;
  }

  &.is-healthy {
    svg {
      fill: ${Color.green};
    }
  }
  &.is-building,
  &.is-pending {
    svg {
      fill: ${Color.grayLightest};
      animation: ${spin} 4s linear infinite;
      width: 80%;
    }
  }
  &.is-pending {
    ${StatusMsg} {
      animation: ${Glow.opacity} 2s linear infinite;
    }
  }
  &.is-error {
    color: ${Color.red};
    svg {
      fill: ${Color.red};
    }
  }
  &.is-none {
    color: ${Color.gray50};
  }
  &.is-disabled {
    color: ${Color.gray60};
  }
`
const StatusIcon = styled.span`
  display: flex;
  align-items: center;
  margin-right: ${SizeUnit(0.2)};
  width: ${SizeUnit(0.5)};
  flex-shrink: 0;

  svg {
    width: 100%;
  }
`

type OverviewTableStatusProps = {
  status: ResourceStatus
  resourceName: string
  lastBuildDur?: moment.Duration | null
  isBuild?: boolean
  hold?: Hold | null
}

export default function OverviewTableStatus(props: OverviewTableStatusProps) {
  let { status, lastBuildDur, isBuild, resourceName, hold } = props
  let icon = null
  let msg = ""
  let tooltip = ""
  let classes = ""

  switch (status) {
    case ResourceStatus.Building:
      icon = <PendingSvg role="presentation" />
      msg = isBuild ? "Updating…" : "Runtime Deploying"
      classes = "is-building"
      break

    case ResourceStatus.None:
      break

    case ResourceStatus.Pending:
      icon = <PendingSvg role="presentation" />
      if (isBuild) {
        msg = "Update Pending"
        tooltip = PendingBuildDescription(hold)
      } else {
        msg = "Runtime Pending"
      }
      classes = "is-pending"
      break

    case ResourceStatus.Warning: {
      let buildDurText = lastBuildDur
        ? ` in ${formatBuildDuration(lastBuildDur)}`
        : ""
      icon = (
        <WarningSvg
          role="presentation"
          fill={Color.yellow}
          width="10px"
          height="10px"
        />
      )
      msg = isBuild ? `Updated${buildDurText}` : "Runtime Ready"
      classes = "is-warning"
      break
    }

    case ResourceStatus.Healthy:
      let buildDurText = lastBuildDur
        ? ` in ${formatBuildDuration(lastBuildDur)}`
        : ""
      icon = <CheckmarkSmallSvg role="presentation" />
      msg = isBuild ? `Updated${buildDurText}` : "Runtime Ready"
      classes = "is-healthy"
      break

    case ResourceStatus.Unhealthy:
      icon = <CloseSvg role="presentation" />
      msg = isBuild ? "Update error" : "Runtime error"
      classes = "is-error"
      break

    case ResourceStatus.Disabled:
      icon = <NotAllowedSvg role="presentation" />
      msg = "Disabled"
      classes = "is-disabled"
      break

    default:
      msg = ""
  }

  const pb = usePathBuilder()
  let url = pb.encpath`/r/${resourceName}/overview`

  if (!msg) return null

  let content = (
    <StyledOverviewTableStatus to={url} className={classes}>
      <StatusIcon>{icon}</StatusIcon>
      <StatusMsg>{msg}</StatusMsg>
    </StyledOverviewTableStatus>
  )

  if (tooltip) {
    return <Tooltip title={tooltip}>{content}</Tooltip>
  }

  return content
}
