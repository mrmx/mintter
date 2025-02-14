// Code generated by protoc-gen-go. DO NOT EDIT.
// versions:
// 	protoc-gen-go v1.31.0
// 	protoc        v3.21.12
// source: entities/v1alpha/entities.proto

package entities

import (
	protoreflect "google.golang.org/protobuf/reflect/protoreflect"
	protoimpl "google.golang.org/protobuf/runtime/protoimpl"
	timestamppb "google.golang.org/protobuf/types/known/timestamppb"
	reflect "reflect"
	sync "sync"
)

const (
	// Verify that this generated code is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(20 - protoimpl.MinVersion)
	// Verify that runtime/protoimpl is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(protoimpl.MaxVersion - 20)
)

// Request to get a change by ID.
type GetChangeRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	// ID of the change.
	Id string `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty"`
}

func (x *GetChangeRequest) Reset() {
	*x = GetChangeRequest{}
	if protoimpl.UnsafeEnabled {
		mi := &file_entities_v1alpha_entities_proto_msgTypes[0]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *GetChangeRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*GetChangeRequest) ProtoMessage() {}

func (x *GetChangeRequest) ProtoReflect() protoreflect.Message {
	mi := &file_entities_v1alpha_entities_proto_msgTypes[0]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use GetChangeRequest.ProtoReflect.Descriptor instead.
func (*GetChangeRequest) Descriptor() ([]byte, []int) {
	return file_entities_v1alpha_entities_proto_rawDescGZIP(), []int{0}
}

func (x *GetChangeRequest) GetId() string {
	if x != nil {
		return x.Id
	}
	return ""
}

// Request to get the timeline of an entity.
type GetEntityTimelineRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	// The entity ID to get the timeline for.
	Id string `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty"`
}

func (x *GetEntityTimelineRequest) Reset() {
	*x = GetEntityTimelineRequest{}
	if protoimpl.UnsafeEnabled {
		mi := &file_entities_v1alpha_entities_proto_msgTypes[1]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *GetEntityTimelineRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*GetEntityTimelineRequest) ProtoMessage() {}

func (x *GetEntityTimelineRequest) ProtoReflect() protoreflect.Message {
	mi := &file_entities_v1alpha_entities_proto_msgTypes[1]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use GetEntityTimelineRequest.ProtoReflect.Descriptor instead.
func (*GetEntityTimelineRequest) Descriptor() ([]byte, []int) {
	return file_entities_v1alpha_entities_proto_rawDescGZIP(), []int{1}
}

func (x *GetEntityTimelineRequest) GetId() string {
	if x != nil {
		return x.Id
	}
	return ""
}

// Request to discover an entity.
type DiscoverEntityRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	// Required. The entity ID to discover.
	Id string `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty"`
	// Optional. Version of the entity to discover.
	Version string `protobuf:"bytes,2,opt,name=version,proto3" json:"version,omitempty"`
}

func (x *DiscoverEntityRequest) Reset() {
	*x = DiscoverEntityRequest{}
	if protoimpl.UnsafeEnabled {
		mi := &file_entities_v1alpha_entities_proto_msgTypes[2]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *DiscoverEntityRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*DiscoverEntityRequest) ProtoMessage() {}

func (x *DiscoverEntityRequest) ProtoReflect() protoreflect.Message {
	mi := &file_entities_v1alpha_entities_proto_msgTypes[2]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use DiscoverEntityRequest.ProtoReflect.Descriptor instead.
func (*DiscoverEntityRequest) Descriptor() ([]byte, []int) {
	return file_entities_v1alpha_entities_proto_rawDescGZIP(), []int{2}
}

func (x *DiscoverEntityRequest) GetId() string {
	if x != nil {
		return x.Id
	}
	return ""
}

func (x *DiscoverEntityRequest) GetVersion() string {
	if x != nil {
		return x.Version
	}
	return ""
}

// Response to discover an entity.
type DiscoverEntityResponse struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields
}

func (x *DiscoverEntityResponse) Reset() {
	*x = DiscoverEntityResponse{}
	if protoimpl.UnsafeEnabled {
		mi := &file_entities_v1alpha_entities_proto_msgTypes[3]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *DiscoverEntityResponse) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*DiscoverEntityResponse) ProtoMessage() {}

func (x *DiscoverEntityResponse) ProtoReflect() protoreflect.Message {
	mi := &file_entities_v1alpha_entities_proto_msgTypes[3]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use DiscoverEntityResponse.ProtoReflect.Descriptor instead.
func (*DiscoverEntityResponse) Descriptor() ([]byte, []int) {
	return file_entities_v1alpha_entities_proto_rawDescGZIP(), []int{3}
}

// A change to an entity.
type Change struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	// ID of the change.
	Id string `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty"`
	// Author of the change.
	Author string `protobuf:"bytes,2,opt,name=author,proto3" json:"author,omitempty"`
	// Timestamp when the change was created.
	CreateTime *timestamppb.Timestamp `protobuf:"bytes,3,opt,name=create_time,json=createTime,proto3" json:"create_time,omitempty"`
	// IDs of other changes this change depends on.
	Deps []string `protobuf:"bytes,4,rep,name=deps,proto3" json:"deps,omitempty"`
	// IDs of other changes that depend on this change.
	Children []string `protobuf:"bytes,6,rep,name=children,proto3" json:"children,omitempty"`
	// Indicates whether this changes comes from a trusted peer of ours.
	IsTrusted bool `protobuf:"varint,5,opt,name=is_trusted,json=isTrusted,proto3" json:"is_trusted,omitempty"`
}

func (x *Change) Reset() {
	*x = Change{}
	if protoimpl.UnsafeEnabled {
		mi := &file_entities_v1alpha_entities_proto_msgTypes[4]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *Change) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*Change) ProtoMessage() {}

func (x *Change) ProtoReflect() protoreflect.Message {
	mi := &file_entities_v1alpha_entities_proto_msgTypes[4]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use Change.ProtoReflect.Descriptor instead.
func (*Change) Descriptor() ([]byte, []int) {
	return file_entities_v1alpha_entities_proto_rawDescGZIP(), []int{4}
}

func (x *Change) GetId() string {
	if x != nil {
		return x.Id
	}
	return ""
}

func (x *Change) GetAuthor() string {
	if x != nil {
		return x.Author
	}
	return ""
}

func (x *Change) GetCreateTime() *timestamppb.Timestamp {
	if x != nil {
		return x.CreateTime
	}
	return nil
}

func (x *Change) GetDeps() []string {
	if x != nil {
		return x.Deps
	}
	return nil
}

func (x *Change) GetChildren() []string {
	if x != nil {
		return x.Children
	}
	return nil
}

func (x *Change) GetIsTrusted() bool {
	if x != nil {
		return x.IsTrusted
	}
	return false
}

// The timeline of an entity.
type EntityTimeline struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	// The ID of the entity.
	Id string `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty"`
	// Account ID of the owner of the entity.
	Owner string `protobuf:"bytes,2,opt,name=owner,proto3" json:"owner,omitempty"`
	// The set of changes for the entity keyed by change ID.
	Changes map[string]*Change `protobuf:"bytes,3,rep,name=changes,proto3" json:"changes,omitempty" protobuf_key:"bytes,1,opt,name=key,proto3" protobuf_val:"bytes,2,opt,name=value,proto3"`
	// The sorted list of change IDs by time.
	ChangesByTime []string `protobuf:"bytes,4,rep,name=changes_by_time,json=changesByTime,proto3" json:"changes_by_time,omitempty"`
	// The set of changes that has no dependencies.
	// Normally there should only be one root,
	// but just in case it's defined as a list.
	Roots []string `protobuf:"bytes,5,rep,name=roots,proto3" json:"roots,omitempty"`
	// The set of leaf changes considering the entire DAG.
	Heads []string `protobuf:"bytes,6,rep,name=heads,proto3" json:"heads,omitempty"`
	// The set of author versions/variants sorted by timestamp.
	AuthorVersions []*AuthorVersion `protobuf:"bytes,7,rep,name=author_versions,json=authorVersions,proto3" json:"author_versions,omitempty"`
}

func (x *EntityTimeline) Reset() {
	*x = EntityTimeline{}
	if protoimpl.UnsafeEnabled {
		mi := &file_entities_v1alpha_entities_proto_msgTypes[5]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *EntityTimeline) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*EntityTimeline) ProtoMessage() {}

func (x *EntityTimeline) ProtoReflect() protoreflect.Message {
	mi := &file_entities_v1alpha_entities_proto_msgTypes[5]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use EntityTimeline.ProtoReflect.Descriptor instead.
func (*EntityTimeline) Descriptor() ([]byte, []int) {
	return file_entities_v1alpha_entities_proto_rawDescGZIP(), []int{5}
}

func (x *EntityTimeline) GetId() string {
	if x != nil {
		return x.Id
	}
	return ""
}

func (x *EntityTimeline) GetOwner() string {
	if x != nil {
		return x.Owner
	}
	return ""
}

func (x *EntityTimeline) GetChanges() map[string]*Change {
	if x != nil {
		return x.Changes
	}
	return nil
}

func (x *EntityTimeline) GetChangesByTime() []string {
	if x != nil {
		return x.ChangesByTime
	}
	return nil
}

func (x *EntityTimeline) GetRoots() []string {
	if x != nil {
		return x.Roots
	}
	return nil
}

func (x *EntityTimeline) GetHeads() []string {
	if x != nil {
		return x.Heads
	}
	return nil
}

func (x *EntityTimeline) GetAuthorVersions() []*AuthorVersion {
	if x != nil {
		return x.AuthorVersions
	}
	return nil
}

// Set of heads from a given author.
type AuthorVersion struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	// Account ID of the author.
	Author string `protobuf:"bytes,1,opt,name=author,proto3" json:"author,omitempty"`
	// The set of leaf changes from that author.
	Heads []string `protobuf:"bytes,2,rep,name=heads,proto3" json:"heads,omitempty"`
	// The version string corresponding to the author's variant.
	// I.e. same as heads but concatenated with a '.' delimiter.
	Version string `protobuf:"bytes,3,opt,name=version,proto3" json:"version,omitempty"`
	// The timestamp of the author's version.
	// For compound versions the greatest timestamp is used.
	VersionTime *timestamppb.Timestamp `protobuf:"bytes,4,opt,name=version_time,json=versionTime,proto3" json:"version_time,omitempty"`
}

func (x *AuthorVersion) Reset() {
	*x = AuthorVersion{}
	if protoimpl.UnsafeEnabled {
		mi := &file_entities_v1alpha_entities_proto_msgTypes[6]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *AuthorVersion) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*AuthorVersion) ProtoMessage() {}

func (x *AuthorVersion) ProtoReflect() protoreflect.Message {
	mi := &file_entities_v1alpha_entities_proto_msgTypes[6]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use AuthorVersion.ProtoReflect.Descriptor instead.
func (*AuthorVersion) Descriptor() ([]byte, []int) {
	return file_entities_v1alpha_entities_proto_rawDescGZIP(), []int{6}
}

func (x *AuthorVersion) GetAuthor() string {
	if x != nil {
		return x.Author
	}
	return ""
}

func (x *AuthorVersion) GetHeads() []string {
	if x != nil {
		return x.Heads
	}
	return nil
}

func (x *AuthorVersion) GetVersion() string {
	if x != nil {
		return x.Version
	}
	return ""
}

func (x *AuthorVersion) GetVersionTime() *timestamppb.Timestamp {
	if x != nil {
		return x.VersionTime
	}
	return nil
}

var File_entities_v1alpha_entities_proto protoreflect.FileDescriptor

var file_entities_v1alpha_entities_proto_rawDesc = []byte{
	0x0a, 0x1f, 0x65, 0x6e, 0x74, 0x69, 0x74, 0x69, 0x65, 0x73, 0x2f, 0x76, 0x31, 0x61, 0x6c, 0x70,
	0x68, 0x61, 0x2f, 0x65, 0x6e, 0x74, 0x69, 0x74, 0x69, 0x65, 0x73, 0x2e, 0x70, 0x72, 0x6f, 0x74,
	0x6f, 0x12, 0x1c, 0x63, 0x6f, 0x6d, 0x2e, 0x6d, 0x69, 0x6e, 0x74, 0x74, 0x65, 0x72, 0x2e, 0x65,
	0x6e, 0x74, 0x69, 0x74, 0x69, 0x65, 0x73, 0x2e, 0x76, 0x31, 0x61, 0x6c, 0x70, 0x68, 0x61, 0x1a,
	0x1f, 0x67, 0x6f, 0x6f, 0x67, 0x6c, 0x65, 0x2f, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x62, 0x75, 0x66,
	0x2f, 0x74, 0x69, 0x6d, 0x65, 0x73, 0x74, 0x61, 0x6d, 0x70, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f,
	0x22, 0x22, 0x0a, 0x10, 0x47, 0x65, 0x74, 0x43, 0x68, 0x61, 0x6e, 0x67, 0x65, 0x52, 0x65, 0x71,
	0x75, 0x65, 0x73, 0x74, 0x12, 0x0e, 0x0a, 0x02, 0x69, 0x64, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09,
	0x52, 0x02, 0x69, 0x64, 0x22, 0x2a, 0x0a, 0x18, 0x47, 0x65, 0x74, 0x45, 0x6e, 0x74, 0x69, 0x74,
	0x79, 0x54, 0x69, 0x6d, 0x65, 0x6c, 0x69, 0x6e, 0x65, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74,
	0x12, 0x0e, 0x0a, 0x02, 0x69, 0x64, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x02, 0x69, 0x64,
	0x22, 0x41, 0x0a, 0x15, 0x44, 0x69, 0x73, 0x63, 0x6f, 0x76, 0x65, 0x72, 0x45, 0x6e, 0x74, 0x69,
	0x74, 0x79, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x12, 0x0e, 0x0a, 0x02, 0x69, 0x64, 0x18,
	0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x02, 0x69, 0x64, 0x12, 0x18, 0x0a, 0x07, 0x76, 0x65, 0x72,
	0x73, 0x69, 0x6f, 0x6e, 0x18, 0x02, 0x20, 0x01, 0x28, 0x09, 0x52, 0x07, 0x76, 0x65, 0x72, 0x73,
	0x69, 0x6f, 0x6e, 0x22, 0x18, 0x0a, 0x16, 0x44, 0x69, 0x73, 0x63, 0x6f, 0x76, 0x65, 0x72, 0x45,
	0x6e, 0x74, 0x69, 0x74, 0x79, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65, 0x22, 0xbc, 0x01,
	0x0a, 0x06, 0x43, 0x68, 0x61, 0x6e, 0x67, 0x65, 0x12, 0x0e, 0x0a, 0x02, 0x69, 0x64, 0x18, 0x01,
	0x20, 0x01, 0x28, 0x09, 0x52, 0x02, 0x69, 0x64, 0x12, 0x16, 0x0a, 0x06, 0x61, 0x75, 0x74, 0x68,
	0x6f, 0x72, 0x18, 0x02, 0x20, 0x01, 0x28, 0x09, 0x52, 0x06, 0x61, 0x75, 0x74, 0x68, 0x6f, 0x72,
	0x12, 0x3b, 0x0a, 0x0b, 0x63, 0x72, 0x65, 0x61, 0x74, 0x65, 0x5f, 0x74, 0x69, 0x6d, 0x65, 0x18,
	0x03, 0x20, 0x01, 0x28, 0x0b, 0x32, 0x1a, 0x2e, 0x67, 0x6f, 0x6f, 0x67, 0x6c, 0x65, 0x2e, 0x70,
	0x72, 0x6f, 0x74, 0x6f, 0x62, 0x75, 0x66, 0x2e, 0x54, 0x69, 0x6d, 0x65, 0x73, 0x74, 0x61, 0x6d,
	0x70, 0x52, 0x0a, 0x63, 0x72, 0x65, 0x61, 0x74, 0x65, 0x54, 0x69, 0x6d, 0x65, 0x12, 0x12, 0x0a,
	0x04, 0x64, 0x65, 0x70, 0x73, 0x18, 0x04, 0x20, 0x03, 0x28, 0x09, 0x52, 0x04, 0x64, 0x65, 0x70,
	0x73, 0x12, 0x1a, 0x0a, 0x08, 0x63, 0x68, 0x69, 0x6c, 0x64, 0x72, 0x65, 0x6e, 0x18, 0x06, 0x20,
	0x03, 0x28, 0x09, 0x52, 0x08, 0x63, 0x68, 0x69, 0x6c, 0x64, 0x72, 0x65, 0x6e, 0x12, 0x1d, 0x0a,
	0x0a, 0x69, 0x73, 0x5f, 0x74, 0x72, 0x75, 0x73, 0x74, 0x65, 0x64, 0x18, 0x05, 0x20, 0x01, 0x28,
	0x08, 0x52, 0x09, 0x69, 0x73, 0x54, 0x72, 0x75, 0x73, 0x74, 0x65, 0x64, 0x22, 0x97, 0x03, 0x0a,
	0x0e, 0x45, 0x6e, 0x74, 0x69, 0x74, 0x79, 0x54, 0x69, 0x6d, 0x65, 0x6c, 0x69, 0x6e, 0x65, 0x12,
	0x0e, 0x0a, 0x02, 0x69, 0x64, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x02, 0x69, 0x64, 0x12,
	0x14, 0x0a, 0x05, 0x6f, 0x77, 0x6e, 0x65, 0x72, 0x18, 0x02, 0x20, 0x01, 0x28, 0x09, 0x52, 0x05,
	0x6f, 0x77, 0x6e, 0x65, 0x72, 0x12, 0x53, 0x0a, 0x07, 0x63, 0x68, 0x61, 0x6e, 0x67, 0x65, 0x73,
	0x18, 0x03, 0x20, 0x03, 0x28, 0x0b, 0x32, 0x39, 0x2e, 0x63, 0x6f, 0x6d, 0x2e, 0x6d, 0x69, 0x6e,
	0x74, 0x74, 0x65, 0x72, 0x2e, 0x65, 0x6e, 0x74, 0x69, 0x74, 0x69, 0x65, 0x73, 0x2e, 0x76, 0x31,
	0x61, 0x6c, 0x70, 0x68, 0x61, 0x2e, 0x45, 0x6e, 0x74, 0x69, 0x74, 0x79, 0x54, 0x69, 0x6d, 0x65,
	0x6c, 0x69, 0x6e, 0x65, 0x2e, 0x43, 0x68, 0x61, 0x6e, 0x67, 0x65, 0x73, 0x45, 0x6e, 0x74, 0x72,
	0x79, 0x52, 0x07, 0x63, 0x68, 0x61, 0x6e, 0x67, 0x65, 0x73, 0x12, 0x26, 0x0a, 0x0f, 0x63, 0x68,
	0x61, 0x6e, 0x67, 0x65, 0x73, 0x5f, 0x62, 0x79, 0x5f, 0x74, 0x69, 0x6d, 0x65, 0x18, 0x04, 0x20,
	0x03, 0x28, 0x09, 0x52, 0x0d, 0x63, 0x68, 0x61, 0x6e, 0x67, 0x65, 0x73, 0x42, 0x79, 0x54, 0x69,
	0x6d, 0x65, 0x12, 0x14, 0x0a, 0x05, 0x72, 0x6f, 0x6f, 0x74, 0x73, 0x18, 0x05, 0x20, 0x03, 0x28,
	0x09, 0x52, 0x05, 0x72, 0x6f, 0x6f, 0x74, 0x73, 0x12, 0x14, 0x0a, 0x05, 0x68, 0x65, 0x61, 0x64,
	0x73, 0x18, 0x06, 0x20, 0x03, 0x28, 0x09, 0x52, 0x05, 0x68, 0x65, 0x61, 0x64, 0x73, 0x12, 0x54,
	0x0a, 0x0f, 0x61, 0x75, 0x74, 0x68, 0x6f, 0x72, 0x5f, 0x76, 0x65, 0x72, 0x73, 0x69, 0x6f, 0x6e,
	0x73, 0x18, 0x07, 0x20, 0x03, 0x28, 0x0b, 0x32, 0x2b, 0x2e, 0x63, 0x6f, 0x6d, 0x2e, 0x6d, 0x69,
	0x6e, 0x74, 0x74, 0x65, 0x72, 0x2e, 0x65, 0x6e, 0x74, 0x69, 0x74, 0x69, 0x65, 0x73, 0x2e, 0x76,
	0x31, 0x61, 0x6c, 0x70, 0x68, 0x61, 0x2e, 0x41, 0x75, 0x74, 0x68, 0x6f, 0x72, 0x56, 0x65, 0x72,
	0x73, 0x69, 0x6f, 0x6e, 0x52, 0x0e, 0x61, 0x75, 0x74, 0x68, 0x6f, 0x72, 0x56, 0x65, 0x72, 0x73,
	0x69, 0x6f, 0x6e, 0x73, 0x1a, 0x60, 0x0a, 0x0c, 0x43, 0x68, 0x61, 0x6e, 0x67, 0x65, 0x73, 0x45,
	0x6e, 0x74, 0x72, 0x79, 0x12, 0x10, 0x0a, 0x03, 0x6b, 0x65, 0x79, 0x18, 0x01, 0x20, 0x01, 0x28,
	0x09, 0x52, 0x03, 0x6b, 0x65, 0x79, 0x12, 0x3a, 0x0a, 0x05, 0x76, 0x61, 0x6c, 0x75, 0x65, 0x18,
	0x02, 0x20, 0x01, 0x28, 0x0b, 0x32, 0x24, 0x2e, 0x63, 0x6f, 0x6d, 0x2e, 0x6d, 0x69, 0x6e, 0x74,
	0x74, 0x65, 0x72, 0x2e, 0x65, 0x6e, 0x74, 0x69, 0x74, 0x69, 0x65, 0x73, 0x2e, 0x76, 0x31, 0x61,
	0x6c, 0x70, 0x68, 0x61, 0x2e, 0x43, 0x68, 0x61, 0x6e, 0x67, 0x65, 0x52, 0x05, 0x76, 0x61, 0x6c,
	0x75, 0x65, 0x3a, 0x02, 0x38, 0x01, 0x22, 0x96, 0x01, 0x0a, 0x0d, 0x41, 0x75, 0x74, 0x68, 0x6f,
	0x72, 0x56, 0x65, 0x72, 0x73, 0x69, 0x6f, 0x6e, 0x12, 0x16, 0x0a, 0x06, 0x61, 0x75, 0x74, 0x68,
	0x6f, 0x72, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x06, 0x61, 0x75, 0x74, 0x68, 0x6f, 0x72,
	0x12, 0x14, 0x0a, 0x05, 0x68, 0x65, 0x61, 0x64, 0x73, 0x18, 0x02, 0x20, 0x03, 0x28, 0x09, 0x52,
	0x05, 0x68, 0x65, 0x61, 0x64, 0x73, 0x12, 0x18, 0x0a, 0x07, 0x76, 0x65, 0x72, 0x73, 0x69, 0x6f,
	0x6e, 0x18, 0x03, 0x20, 0x01, 0x28, 0x09, 0x52, 0x07, 0x76, 0x65, 0x72, 0x73, 0x69, 0x6f, 0x6e,
	0x12, 0x3d, 0x0a, 0x0c, 0x76, 0x65, 0x72, 0x73, 0x69, 0x6f, 0x6e, 0x5f, 0x74, 0x69, 0x6d, 0x65,
	0x18, 0x04, 0x20, 0x01, 0x28, 0x0b, 0x32, 0x1a, 0x2e, 0x67, 0x6f, 0x6f, 0x67, 0x6c, 0x65, 0x2e,
	0x70, 0x72, 0x6f, 0x74, 0x6f, 0x62, 0x75, 0x66, 0x2e, 0x54, 0x69, 0x6d, 0x65, 0x73, 0x74, 0x61,
	0x6d, 0x70, 0x52, 0x0b, 0x76, 0x65, 0x72, 0x73, 0x69, 0x6f, 0x6e, 0x54, 0x69, 0x6d, 0x65, 0x32,
	0xe5, 0x02, 0x0a, 0x08, 0x45, 0x6e, 0x74, 0x69, 0x74, 0x69, 0x65, 0x73, 0x12, 0x61, 0x0a, 0x09,
	0x47, 0x65, 0x74, 0x43, 0x68, 0x61, 0x6e, 0x67, 0x65, 0x12, 0x2e, 0x2e, 0x63, 0x6f, 0x6d, 0x2e,
	0x6d, 0x69, 0x6e, 0x74, 0x74, 0x65, 0x72, 0x2e, 0x65, 0x6e, 0x74, 0x69, 0x74, 0x69, 0x65, 0x73,
	0x2e, 0x76, 0x31, 0x61, 0x6c, 0x70, 0x68, 0x61, 0x2e, 0x47, 0x65, 0x74, 0x43, 0x68, 0x61, 0x6e,
	0x67, 0x65, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x1a, 0x24, 0x2e, 0x63, 0x6f, 0x6d, 0x2e,
	0x6d, 0x69, 0x6e, 0x74, 0x74, 0x65, 0x72, 0x2e, 0x65, 0x6e, 0x74, 0x69, 0x74, 0x69, 0x65, 0x73,
	0x2e, 0x76, 0x31, 0x61, 0x6c, 0x70, 0x68, 0x61, 0x2e, 0x43, 0x68, 0x61, 0x6e, 0x67, 0x65, 0x12,
	0x79, 0x0a, 0x11, 0x47, 0x65, 0x74, 0x45, 0x6e, 0x74, 0x69, 0x74, 0x79, 0x54, 0x69, 0x6d, 0x65,
	0x6c, 0x69, 0x6e, 0x65, 0x12, 0x36, 0x2e, 0x63, 0x6f, 0x6d, 0x2e, 0x6d, 0x69, 0x6e, 0x74, 0x74,
	0x65, 0x72, 0x2e, 0x65, 0x6e, 0x74, 0x69, 0x74, 0x69, 0x65, 0x73, 0x2e, 0x76, 0x31, 0x61, 0x6c,
	0x70, 0x68, 0x61, 0x2e, 0x47, 0x65, 0x74, 0x45, 0x6e, 0x74, 0x69, 0x74, 0x79, 0x54, 0x69, 0x6d,
	0x65, 0x6c, 0x69, 0x6e, 0x65, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x1a, 0x2c, 0x2e, 0x63,
	0x6f, 0x6d, 0x2e, 0x6d, 0x69, 0x6e, 0x74, 0x74, 0x65, 0x72, 0x2e, 0x65, 0x6e, 0x74, 0x69, 0x74,
	0x69, 0x65, 0x73, 0x2e, 0x76, 0x31, 0x61, 0x6c, 0x70, 0x68, 0x61, 0x2e, 0x45, 0x6e, 0x74, 0x69,
	0x74, 0x79, 0x54, 0x69, 0x6d, 0x65, 0x6c, 0x69, 0x6e, 0x65, 0x12, 0x7b, 0x0a, 0x0e, 0x44, 0x69,
	0x73, 0x63, 0x6f, 0x76, 0x65, 0x72, 0x45, 0x6e, 0x74, 0x69, 0x74, 0x79, 0x12, 0x33, 0x2e, 0x63,
	0x6f, 0x6d, 0x2e, 0x6d, 0x69, 0x6e, 0x74, 0x74, 0x65, 0x72, 0x2e, 0x65, 0x6e, 0x74, 0x69, 0x74,
	0x69, 0x65, 0x73, 0x2e, 0x76, 0x31, 0x61, 0x6c, 0x70, 0x68, 0x61, 0x2e, 0x44, 0x69, 0x73, 0x63,
	0x6f, 0x76, 0x65, 0x72, 0x45, 0x6e, 0x74, 0x69, 0x74, 0x79, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73,
	0x74, 0x1a, 0x34, 0x2e, 0x63, 0x6f, 0x6d, 0x2e, 0x6d, 0x69, 0x6e, 0x74, 0x74, 0x65, 0x72, 0x2e,
	0x65, 0x6e, 0x74, 0x69, 0x74, 0x69, 0x65, 0x73, 0x2e, 0x76, 0x31, 0x61, 0x6c, 0x70, 0x68, 0x61,
	0x2e, 0x44, 0x69, 0x73, 0x63, 0x6f, 0x76, 0x65, 0x72, 0x45, 0x6e, 0x74, 0x69, 0x74, 0x79, 0x52,
	0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65, 0x42, 0x34, 0x5a, 0x32, 0x6d, 0x69, 0x6e, 0x74, 0x74,
	0x65, 0x72, 0x2f, 0x62, 0x61, 0x63, 0x6b, 0x65, 0x6e, 0x64, 0x2f, 0x67, 0x65, 0x6e, 0x70, 0x72,
	0x6f, 0x74, 0x6f, 0x2f, 0x65, 0x6e, 0x74, 0x69, 0x74, 0x69, 0x65, 0x73, 0x2f, 0x76, 0x31, 0x61,
	0x6c, 0x70, 0x68, 0x61, 0x3b, 0x65, 0x6e, 0x74, 0x69, 0x74, 0x69, 0x65, 0x73, 0x62, 0x06, 0x70,
	0x72, 0x6f, 0x74, 0x6f, 0x33,
}

var (
	file_entities_v1alpha_entities_proto_rawDescOnce sync.Once
	file_entities_v1alpha_entities_proto_rawDescData = file_entities_v1alpha_entities_proto_rawDesc
)

func file_entities_v1alpha_entities_proto_rawDescGZIP() []byte {
	file_entities_v1alpha_entities_proto_rawDescOnce.Do(func() {
		file_entities_v1alpha_entities_proto_rawDescData = protoimpl.X.CompressGZIP(file_entities_v1alpha_entities_proto_rawDescData)
	})
	return file_entities_v1alpha_entities_proto_rawDescData
}

var file_entities_v1alpha_entities_proto_msgTypes = make([]protoimpl.MessageInfo, 8)
var file_entities_v1alpha_entities_proto_goTypes = []interface{}{
	(*GetChangeRequest)(nil),         // 0: com.mintter.entities.v1alpha.GetChangeRequest
	(*GetEntityTimelineRequest)(nil), // 1: com.mintter.entities.v1alpha.GetEntityTimelineRequest
	(*DiscoverEntityRequest)(nil),    // 2: com.mintter.entities.v1alpha.DiscoverEntityRequest
	(*DiscoverEntityResponse)(nil),   // 3: com.mintter.entities.v1alpha.DiscoverEntityResponse
	(*Change)(nil),                   // 4: com.mintter.entities.v1alpha.Change
	(*EntityTimeline)(nil),           // 5: com.mintter.entities.v1alpha.EntityTimeline
	(*AuthorVersion)(nil),            // 6: com.mintter.entities.v1alpha.AuthorVersion
	nil,                              // 7: com.mintter.entities.v1alpha.EntityTimeline.ChangesEntry
	(*timestamppb.Timestamp)(nil),    // 8: google.protobuf.Timestamp
}
var file_entities_v1alpha_entities_proto_depIdxs = []int32{
	8, // 0: com.mintter.entities.v1alpha.Change.create_time:type_name -> google.protobuf.Timestamp
	7, // 1: com.mintter.entities.v1alpha.EntityTimeline.changes:type_name -> com.mintter.entities.v1alpha.EntityTimeline.ChangesEntry
	6, // 2: com.mintter.entities.v1alpha.EntityTimeline.author_versions:type_name -> com.mintter.entities.v1alpha.AuthorVersion
	8, // 3: com.mintter.entities.v1alpha.AuthorVersion.version_time:type_name -> google.protobuf.Timestamp
	4, // 4: com.mintter.entities.v1alpha.EntityTimeline.ChangesEntry.value:type_name -> com.mintter.entities.v1alpha.Change
	0, // 5: com.mintter.entities.v1alpha.Entities.GetChange:input_type -> com.mintter.entities.v1alpha.GetChangeRequest
	1, // 6: com.mintter.entities.v1alpha.Entities.GetEntityTimeline:input_type -> com.mintter.entities.v1alpha.GetEntityTimelineRequest
	2, // 7: com.mintter.entities.v1alpha.Entities.DiscoverEntity:input_type -> com.mintter.entities.v1alpha.DiscoverEntityRequest
	4, // 8: com.mintter.entities.v1alpha.Entities.GetChange:output_type -> com.mintter.entities.v1alpha.Change
	5, // 9: com.mintter.entities.v1alpha.Entities.GetEntityTimeline:output_type -> com.mintter.entities.v1alpha.EntityTimeline
	3, // 10: com.mintter.entities.v1alpha.Entities.DiscoverEntity:output_type -> com.mintter.entities.v1alpha.DiscoverEntityResponse
	8, // [8:11] is the sub-list for method output_type
	5, // [5:8] is the sub-list for method input_type
	5, // [5:5] is the sub-list for extension type_name
	5, // [5:5] is the sub-list for extension extendee
	0, // [0:5] is the sub-list for field type_name
}

func init() { file_entities_v1alpha_entities_proto_init() }
func file_entities_v1alpha_entities_proto_init() {
	if File_entities_v1alpha_entities_proto != nil {
		return
	}
	if !protoimpl.UnsafeEnabled {
		file_entities_v1alpha_entities_proto_msgTypes[0].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*GetChangeRequest); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_entities_v1alpha_entities_proto_msgTypes[1].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*GetEntityTimelineRequest); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_entities_v1alpha_entities_proto_msgTypes[2].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*DiscoverEntityRequest); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_entities_v1alpha_entities_proto_msgTypes[3].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*DiscoverEntityResponse); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_entities_v1alpha_entities_proto_msgTypes[4].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*Change); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_entities_v1alpha_entities_proto_msgTypes[5].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*EntityTimeline); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_entities_v1alpha_entities_proto_msgTypes[6].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*AuthorVersion); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
	}
	type x struct{}
	out := protoimpl.TypeBuilder{
		File: protoimpl.DescBuilder{
			GoPackagePath: reflect.TypeOf(x{}).PkgPath(),
			RawDescriptor: file_entities_v1alpha_entities_proto_rawDesc,
			NumEnums:      0,
			NumMessages:   8,
			NumExtensions: 0,
			NumServices:   1,
		},
		GoTypes:           file_entities_v1alpha_entities_proto_goTypes,
		DependencyIndexes: file_entities_v1alpha_entities_proto_depIdxs,
		MessageInfos:      file_entities_v1alpha_entities_proto_msgTypes,
	}.Build()
	File_entities_v1alpha_entities_proto = out.File
	file_entities_v1alpha_entities_proto_rawDesc = nil
	file_entities_v1alpha_entities_proto_goTypes = nil
	file_entities_v1alpha_entities_proto_depIdxs = nil
}
