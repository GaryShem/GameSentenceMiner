export function resolveProjectVersion(appVersion, currentProjectVersion) {
  // npm strips SemVer build metadata (`+...`) when stamping package.json, so
  // custom desktop builds use a real prerelease identifier. Translate that to
  // PEP 440 local metadata to give every bundled wheel a distinct version too.
  const customPrerelease = /^(\d+(?:\.\d+)+)-fwiffo-custom\.(\d+)$/.exec(appVersion);
  if (customPrerelease) {
    return `${customPrerelease[1]}+fwiffo.custom.${customPrerelease[2]}`;
  }

  const postReleasePrefix = `${appVersion}.post`;
  if (!currentProjectVersion.startsWith(postReleasePrefix)) {
    return appVersion;
  }

  const postReleaseNumber = currentProjectVersion.slice(postReleasePrefix.length);
  return /^[1-9]\d*$/.test(postReleaseNumber) ? currentProjectVersion : appVersion;
}
