import { CharCode } from './CharCode';
import StringHandle from './StringHandle';
import * as extpath from './ExtPath';
import Path from './Path';
import { URI, UriToFsPath } from './URI';
import { Schemas } from './Schemas';
import PlatformInfo from '../Platform_DLL/PlatformInfo';

export function originalFSPath(uri: URI): string {
	return UriToFsPath(uri, true);
}

//#region IExtUri

export interface IExtUri {

	// --- identity

	/**
	 * Compares two uris.
	 *
	 * @param uri1 Uri
	 * @param uri2 Uri
	 * @param ignoreFragment Ignore the fragment (defaults to `false`)
	 */
	Compare(uri1: URI, uri2: URI, ignoreFragment?: boolean): number;

	/**
	 * Tests whether two uris are equal
	 *
	 * @param uri1 Uri
	 * @param uri2 Uri
	 * @param ignoreFragment Ignore the fragment (defaults to `false`)
	 */
	IsEqual(uri1: URI | undefined, uri2: URI | undefined, ignoreFragment?: boolean): boolean;

	/**
	 * Tests whether a `candidate` URI is a parent or equal of a given `base` URI.
	 *
	 * @param base A uri which is "longer" or at least same length as `parentCandidate`
	 * @param parentCandidate A uri which is "shorter" or up to same length as `base`
	 * @param ignoreFragment Ignore the fragment (defaults to `false`)
	 */
	IsEqualOrParent(base: URI, parentCandidate: URI, ignoreFragment?: boolean): boolean;

	/**
	 * Creates a key from a resource URI to be used to resource comparison and for resource maps.
	 * @see {@link ResourceMap}
	 * @param uri Uri
	 * @param ignoreFragment Ignore the fragment (defaults to `false`)
	 */
	GetComparisonKey(uri: URI, ignoreFragment?: boolean): string;

	/**
	 * Whether the casing of the path-component of the uri should be ignored.
	 */
	IgnorePathCasing(uri: URI): boolean;

	// --- path math

	BasenameOrAuthority(resource: URI): string;

	/**
	 * Returns the basename of the path component of an uri.
	 * @param resource
	 */
	Basename(resource: URI): string;

	/**
	 * Returns the extension of the path component of an uri.
	 * @param resource
	 */
	Extname(resource: URI): string;
	/**
	 * Return a URI representing the directory of a URI path.
	 *
	 * @param resource The input URI.
	 * @returns The URI representing the directory of the input URI.
	 */
	Dirname(resource: URI): URI;
	/**
	 * Join a URI path with path fragments and normalizes the resulting path.
	 *
	 * @param resource The input URI.
	 * @param pathFragment The path fragment to add to the URI path.
	 * @returns The resulting URI.
	 */
	JoinPath(resource: URI, ...pathFragment: string[]): URI;
	/**
	 * Normalizes the path part of a URI: Resolves `.` and `..` elements with directory names.
	 *
	 * @param resource The URI to normalize the path.
	 * @returns The URI with the normalized path.
	 */
	NormalizePath(resource: URI): URI;
	/**
	 *
	 * @param from
	 * @param to
	 */
	RelativePath(from: URI, to: URI): string | undefined;
	/**
	 * Resolves an absolute or relative path against a base URI.
	 * The path can be relative or absolute posix or a Windows path
	 */
	ResolvePath(base: URI, path: string): URI;

	// --- misc

	/**
	 * Returns true if the URI path is absolute.
	 */
	isAbsolutePath(resource: URI): boolean;
	/**
	 * Tests whether the two authorities are the same
	 */
	IsEqualAuthority(a1: string, a2: string): boolean;
	/**
	 * Returns true if the URI path has a trailing path separator
	 */
	HasTrailingPathSeparator(resource: URI, sep?: string): boolean;
	/**
	 * Removes a trailing path separator, if there's one.
	 * Important: Doesn't remove the first slash, it would make the URI invalid
	 */
	RemoveTrailingPathSeparator(resource: URI, sep?: string): URI;
	/**
	 * Adds a trailing path separator to the URI if there isn't one already.
	 * For example, c:\ would be unchanged, but c:\users would become c:\users\
	 */
	AddTrailingPathSeparator(resource: URI, sep?: string): URI;
}

export class ExtUri implements IExtUri {

	constructor(private _ignorePathCasing: (uri: URI) => boolean) { }

	Compare(uri1: URI, uri2: URI, ignoreFragment: boolean = false): number {
		if (uri1 === uri2) {
			return 0;
		}
		return StringHandle.Compare(this.GetComparisonKey(uri1, ignoreFragment), this.GetComparisonKey(uri2, ignoreFragment));
	}

	IsEqual(uri1: URI | undefined, uri2: URI | undefined, ignoreFragment: boolean = false): boolean {
		if (uri1 === uri2) {
			return true;
		}
		if (!uri1 || !uri2) {
			return false;
		}
		return this.GetComparisonKey(uri1, ignoreFragment) === this.GetComparisonKey(uri2, ignoreFragment);
	}

	GetComparisonKey(uri: URI, ignoreFragment: boolean = false): string {
		return uri.With({
			path: this._ignorePathCasing(uri) ? uri.path.toLowerCase() : undefined,
			fragment: ignoreFragment ? null : undefined
		}).ToString();
	}

	IgnorePathCasing(uri: URI): boolean {
		return this._ignorePathCasing(uri);
	}

	IsEqualOrParent(base: URI, parentCandidate: URI, ignoreFragment: boolean = false): boolean {
		if (base.scheme === parentCandidate.scheme) {
			if (base.scheme === Schemas.file) {
				return extpath.isEqualOrParent(originalFSPath(base), originalFSPath(parentCandidate), this._ignorePathCasing(base)) && base.query === parentCandidate.query && (ignoreFragment || base.fragment === parentCandidate.fragment);
			}
			if (isEqualAuthority(base.authority, parentCandidate.authority)) {
				return extpath.isEqualOrParent(base.path, parentCandidate.path, this._ignorePathCasing(base), '/') && base.query === parentCandidate.query && (ignoreFragment || base.fragment === parentCandidate.fragment);
			}
		}
		return false;
	}

	// --- path math

	JoinPath(resource: URI, ...pathFragment: string[]): URI {
		return URI.JoinPath(resource, ...pathFragment);
	}

	BasenameOrAuthority(resource: URI): string {
		return basename(resource) || resource.authority;
	}

	Basename(resource: URI): string {
		return Path.Basename(resource.path);
	}

	Extname(resource: URI): string {
		return Path.Extname(resource.path);
	}

	Dirname(resource: URI): URI {
		if (resource.path.length === 0) {
			return resource;
		}
		let dirname;
		if (resource.scheme === Schemas.file) {
			dirname = URI.File(Path.Dirname(originalFSPath(resource))).path;
		} else {
			dirname = Path.Dirname(resource.path);
			if (resource.authority && dirname.length && dirname.charCodeAt(0) !== CharCode.Slash) {
				console.error(`dirname("${resource.ToString})) resulted in a relative path`);
				dirname = '/'; // If a URI contains an authority component, then the path component must either be empty or begin with a CharCode.Slash ("/") character
			}
		}
		return resource.With({
			path: dirname
		});
	}

	NormalizePath(resource: URI): URI {
		if (!resource.path.length) {
			return resource;
		}
		let normalizedPath: string;
		if (resource.scheme === Schemas.file) {
			normalizedPath = URI.File(Path.Normalize(originalFSPath(resource))).path;
		} else {
			normalizedPath = Path.Normalize(resource.path);
		}
		return resource.With({
			path: normalizedPath
		});
	}

	RelativePath(from: URI, to: URI): string | undefined {
		if (from.scheme !== to.scheme || !isEqualAuthority(from.authority, to.authority)) {
			return undefined;
		}
		if (from.scheme === Schemas.file) {
			const relativePath = Path.Relative(originalFSPath(from), originalFSPath(to));
			return PlatformInfo.IsWindows ? extpath.toSlashes(relativePath) : relativePath;
		}
		let fromPath = from.path || '/';
		const toPath = to.path || '/';
		if (this._ignorePathCasing(from)) {
			// make casing of fromPath match toPath
			let i = 0;
			for (const len = Math.min(fromPath.length, toPath.length); i < len; i++) {
				if (fromPath.charCodeAt(i) !== toPath.charCodeAt(i)) {
					if (fromPath.charAt(i).toLowerCase() !== toPath.charAt(i).toLowerCase()) {
						break;
					}
				}
			}
			fromPath = toPath.substr(0, i) + fromPath.substr(i);
		}
		return Path.Relative(fromPath, toPath);
	}

	ResolvePath(base: URI, path: string): URI {
		if (base.scheme === Schemas.file) {
			const newURI = URI.File(Path.Resolve(originalFSPath(base), path));
			return base.With({
				authority: newURI.authority,
				path: newURI.path
			});
		}
		path = extpath.toPosixPath(path); // we allow path to be a windows path
		return base.With({
			path: Path.Resolve(base.path, path)
		});
	}

	// --- misc

	isAbsolutePath(resource: URI): boolean {
		return !!resource.path && resource.path[0] === '/';
	}

	IsEqualAuthority(a1: string | undefined, a2: string | undefined) {
		return a1 === a2 || (a1 !== undefined && a2 !== undefined && StringHandle.EqualsIgnoreCase(a1, a2));
	}

	HasTrailingPathSeparator(resource: URI, sep: string = Path.Sep): boolean {
		if (resource.scheme === Schemas.file) {
			const fsp = originalFSPath(resource);
			return fsp.length > extpath.getRoot(fsp).length && fsp[fsp.length - 1] === sep;
		} else {
			const p = resource.path;
			return (p.length > 1 && p.charCodeAt(p.length - 1) === CharCode.Slash) && !(/^[a-zA-Z]:(\/$|\\$)/.test(resource.FsPath)); // ignore the slash at offset 0
		}
	}

	RemoveTrailingPathSeparator(resource: URI, sep: string = Path.Sep): URI {
		// Make sure that the path isn't a drive letter. A trailing separator there is not removable.
		if (hasTrailingPathSeparator(resource, sep)) {
			return resource.With({ path: resource.path.substr(0, resource.path.length - 1) });
		}
		return resource;
	}

	AddTrailingPathSeparator(resource: URI, sep: string = Path.Sep): URI {
		let isRootSep: boolean = false;
		if (resource.scheme === Schemas.file) {
			const fsp = originalFSPath(resource);
			isRootSep = ((fsp !== undefined) && (fsp.length === extpath.getRoot(fsp).length) && (fsp[fsp.length - 1] === sep));
		} else {
			sep = '/';
			const p = resource.path;
			isRootSep = p.length === 1 && p.charCodeAt(p.length - 1) === CharCode.Slash;
		}
		if (!isRootSep && !hasTrailingPathSeparator(resource, sep)) {
			return resource.With({ path: resource.path + '/' });
		}
		return resource;
	}
}


/**
 * Unbiased utility that takes uris "as they are". This means it can be interchanged with
 * uri#ToString() usages. The following is true
 * ```
 * assertEqual(aUri.ToString() === bUri.ToString(), exturi.isEqual(aUri, bUri))
 * ```
 */
export const extUri = new ExtUri(() => false);

/**
 * BIASED utility that _mostly_ ignored the case of urs paths. ONLY use this util if you
 * understand what you are doing.
 *
 * This utility is INCOMPATIBLE with `uri.ToString()`-usages and both CANNOT be used interchanged.
 *
 * When dealing with uris from files or documents, `extUri` (the unbiased friend)is sufficient
 * because those uris come from a "trustworthy source". When creating unknown uris it's always
 * better to use `IUriIdentityService` which exposes an `IExtUri`-instance which knows when path
 * casing matters.
 */
export const extUriBiasedIgnorePathCase = new ExtUri(uri => {
	// A file scheme resource is in the same platform as code, so ignore case for non linux platforms
	// Resource can be from another platform. Lowering the case as an hack. Should come from File system provider
	return uri.scheme === Schemas.file ? !PlatformInfo.IsLinux : true;
});


/**
 * BIASED utility that always ignores the casing of uris paths. ONLY use this util if you
 * understand what you are doing.
 *
 * This utility is INCOMPATIBLE with `uri.ToString()`-usages and both CANNOT be used interchanged.
 *
 * When dealing with uris from files or documents, `extUri` (the unbiased friend)is sufficient
 * because those uris come from a "trustworthy source". When creating unknown uris it's always
 * better to use `IUriIdentityService` which exposes an `IExtUri`-instance which knows when path
 * casing matters.
 */
export const extUriIgnorePathCase = new ExtUri(_ => true);

export const isEqual = extUri.IsEqual.bind(extUri);
export const isEqualOrParent = extUri.IsEqualOrParent.bind(extUri);
export const getComparisonKey = extUri.GetComparisonKey.bind(extUri);
export const basenameOrAuthority = extUri.BasenameOrAuthority.bind(extUri);
export const basename = extUri.Basename.bind(extUri);
export const extname = extUri.Extname.bind(extUri);
export const dirname = extUri.Dirname.bind(extUri);
export const joinPath = extUri.JoinPath.bind(extUri);
export const normalizePath = extUri.NormalizePath.bind(extUri);
export const relativePath = extUri.RelativePath.bind(extUri);
export const resolvePath = extUri.ResolvePath.bind(extUri);
export const isAbsolutePath = extUri.isAbsolutePath.bind(extUri);
export const isEqualAuthority = extUri.IsEqualAuthority.bind(extUri);
export const hasTrailingPathSeparator = extUri.HasTrailingPathSeparator.bind(extUri);
export const removeTrailingPathSeparator = extUri.RemoveTrailingPathSeparator.bind(extUri);
export const addTrailingPathSeparator = extUri.AddTrailingPathSeparator.bind(extUri);

//#endregion

export function distinctParents<T>(items: T[], resourceAccessor: (item: T) => URI): T[] {
	const distinctParents: T[] = [];
	for (let i = 0; i < items.length; i++) {
		const candidateResource = resourceAccessor(items[i]);
		if (items.some((otherItem, index) => {
			if (index === i) {
				return false;
			}

			return isEqualOrParent(candidateResource, resourceAccessor(otherItem));
		})) {
			continue;
		}

		distinctParents.push(items[i]);
	}

	return distinctParents;
}

/**
 * Data URI related helpers.
 */
export namespace DataUri {

	export const META_DATA_LABEL = 'label';
	export const META_DATA_DESCRIPTION = 'description';
	export const META_DATA_SIZE = 'size';
	export const META_DATA_MIME = 'mime';

	export function parseMetaData(dataUri: URI): Map<string, string> {
		const metadata = new Map<string, string>();

		// Given a URI of:  data:image/png;size:2313;label:SomeLabel;description:SomeDescription;base64,77+9UE5...
		// the metadata is: size:2313;label:SomeLabel;description:SomeDescription
		const meta = dataUri.path.substring(dataUri.path.indexOf(';') + 1, dataUri.path.lastIndexOf(';'));
		meta.split(';').forEach(property => {
			const [key, value] = property.split(':');
			if (key && value) {
				metadata.set(key, value);
			}
		});

		// Given a URI of:  data:image/png;size:2313;label:SomeLabel;description:SomeDescription;base64,77+9UE5...
		// the mime is: image/png
		const mime = dataUri.path.substring(0, dataUri.path.indexOf(';'));
		if (mime) {
			metadata.set(META_DATA_MIME, mime);
		}

		return metadata;
	}
}

export function toLocalResource(resource: URI, authority: string | undefined, localScheme: string): URI {
	if (authority) {
		let path = resource.path;
		if (path && path[0] !== Path.Sep) {
			path = Path.Sep + path;
		}

		return resource.With({ scheme: localScheme, authority, path });
	}

	return resource.With({ scheme: localScheme });
}
